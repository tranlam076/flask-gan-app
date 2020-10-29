"""
StarGAN v2 TensorFlow Implementation
Copyright (c) 2020-present NAVER Corp.

This work is licensed under the Creative Commons Attribution-NonCommercial
4.0 International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc/4.0/ or send a letter to
Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
"""

from server.gan.utils import *
from server.gan.networks import *
import PIL.Image as Image
from server import root_dir
import glob
from random import randint
import os


class StarGAN_v2:
    def __init__(self, args):
        super(StarGAN_v2, self).__init__()

        self.checkpoint_dir = args.checkpoint_dir
        self.batch_size = args.batch_size
        self.img_size = args.img_size
        self.img_ch = args.img_ch

        """ Generator """
        self.latent_dim = args.latent_dim
        self.style_dim = args.style_dim

        """ Mapping Network """
        self.hidden_dim = args.hidden_dim
        self.num_domains = args.num_domains

        """ Init variable"""
        self.generator_ema = None
        self.mapping_network_ema = None
        self.style_encoder_ema = None
        self.ckpt = None
        self.manager = None

    def build_model(self):
        """ Test """
        """ Network """
        self.generator_ema = Generator(self.img_size, self.img_ch, self.style_dim, max_conv_dim=self.hidden_dim,
                                       sn=False, name='Generator')
        self.mapping_network_ema = MappingNetwork(self.style_dim, self.hidden_dim, self.num_domains, sn=False,
                                                  name='MappingNetwork')
        self.style_encoder_ema = StyleEncoder(self.img_size, self.style_dim, self.num_domains,
                                              max_conv_dim=self.hidden_dim, sn=False, name='StyleEncoder')

        """ Finalize model (build) """
        x = np.ones(shape=[self.batch_size, self.img_size, self.img_size, self.img_ch], dtype=np.float32)
        y = np.ones(shape=[self.batch_size, 1], dtype=np.int32)
        z = np.ones(shape=[self.batch_size, self.latent_dim], dtype=np.float32)
        s = np.ones(shape=[self.batch_size, self.style_dim], dtype=np.float32)

        _ = self.mapping_network_ema([z, y])
        _ = self.style_encoder_ema([x, y])
        _ = self.generator_ema([x, s])

        """ Checkpoint """
        self.ckpt = tf.train.Checkpoint(generator_ema=self.generator_ema,
                                        mapping_network_ema=self.mapping_network_ema,
                                        style_encoder_ema=self.style_encoder_ema)
        self.manager = tf.train.CheckpointManager(self.ckpt, self.checkpoint_dir, max_to_keep=1)

        if self.manager.latest_checkpoint:
            self.ckpt.restore(self.manager.latest_checkpoint).expect_partial()
            print('Latest checkpoint restored!!')
        else:
            print('Not restoring from saved checkpoint')

    @staticmethod
    def get_random_refer_path(domain):
        domain_list = sorted([os.path.basename(x) for x in glob.glob(os.path.join(root_dir, "gan", "refer") + '/*')])
        img_list = glob.glob(os.path.join(root_dir, "gan", "refer", domain_list[domain]) + "/*")
        return img_list[randint(0, len(img_list) - 1)]

    def refer_canvas(self, x_real, x_ref, y_trg, in_path, out_path):
        x_real = x_real[:1]
        x_ref = x_ref[:1]
        x_ref_post = postprocess_images(x_ref)
        row_images = np.stack(x_ref_post)
        row_images = preprocess_fit_train_image(row_images)
        row_images_y = np.stack([y_trg])
        # s_trg = self.style_encoder_ema([row_images, row_images_y])

        z_trgs = tf.random.normal(shape=[1, 16])
        z_trg = tf.expand_dims(z_trgs[0], axis=0)
        s_trg = self.mapping_network_ema([z_trg, row_images_y])

        image = postprocess_images(self.generator_ema([x_real, s_trg]))
        image = Image.fromarray(np.uint8(image[0]), 'RGB')

        # x_ref_post = preprocess_fit_train_image(self.generator_ema([x_real, s_trg]))
        # row_images = np.stack(x_ref_post)
        # row_images = preprocess_fit_train_image(row_images)
        # s_trg = self.style_encoder_ema([row_images, row_images_y])
        # image = postprocess_images(self.generator_ema([x_real, s_trg]))
        # image = Image.fromarray(np.uint8(image[0]), 'RGB')

        size = cv2.imread(in_path).shape[:2][::-1]
        image = image.resize(size)
        image.save(out_path)

    def test(self, destination_path=None, src_img_path=None, ref_img_path=None, ref_img_domains=None):
        return_img_path = []
        if src_img_path is None or destination_path is None:
            return return_img_path
        if ref_img_domains is None:
            ref_img_domains = [0]

        src_name, src_extension = os.path.splitext(src_img_path)
        src_name = os.path.basename(src_name)
        src_img = load_images(src_img_path, self.img_size, self.img_ch)
        src_img = tf.expand_dims(src_img, axis=0)
        for ref_img_domain in ref_img_domains:
            image_out = '{}_{}{}'.format(src_name, ref_img_domain, src_extension)
            return_img_path.append(image_out)

            ref_img_path = src_img_path
            # ref_img_path = self.get_random_refer_path(ref_img_domain)
            ref_img = load_images(ref_img_path, self.img_size, self.img_ch)
            ref_img = tf.expand_dims(ref_img, axis=0)

            ref_img_domain = tf.expand_dims([ref_img_domain], axis=0)
            self.refer_canvas(src_img, ref_img, ref_img_domain, src_img_path, destination_path + image_out)
        return return_img_path
