"""
StarGAN v2 TensorFlow Implementation
Copyright (c) 2020-present NAVER Corp.

This work is licensed under the Creative Commons Attribution-NonCommercial
4.0 International License. To view a copy of this license, visit
http://creativecommons.org/licenses/by-nc/4.0/ or send a letter to
Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
"""

from server.gan.StarGAN_v2 import StarGAN_v2
from server.gan.utils import *
from server import root_dir

"""parsing and configuration"""


class Namespace:
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


def load_model():
    args = Namespace(hidden_dim=512, latent_dim=16, style_dim=64, img_size=256, img_ch=3,
                     checkpoint_dir=root_dir + "\\gan\\checkpoint", batch_size=8, num_domains=12)
    automatic_gpu_usage()
    gan = StarGAN_v2(args)
    gan.build_model()

    # gan.test(destination_path=r"C:\Users\LamTQ1\Desktop\flask-gan\server\templates\files\output/",
    #          src_img_path=r"C:\Users\LamTQ1\Desktop\flask-gan\server\templates\files\000007.jpg",
    #          ref_img_domains=[0])
    # print(" [*] Test finished!")

    return gan
