import threading
import json
from server import root_dir, soc
from server.gan import load_gan

gan = load_gan.load_model()


class face_detect_thread(threading.Thread):

    def __init__(self, data):
        super().__init__()
        self.data = data  # Initialize data for thread
        print(data)

    def run(self):
        global gan
        file_path = root_dir + '\\templates\\files\\'
        sample = file_path + self.data["params"]["filename"]
        output = root_dir + '\\templates\\files\\output\\'
        domain = self.data["params"]["domain"].split(",")
        domain = [int(x) for x in domain]
        if self.data["params"]["is_merge"] == "false":
            is_merge = False
        else:
            is_merge = True
        out = gan.test(destination_path=output, src_img_path=sample, ref_img_domains=domain)
        out = ["output/" + x for x in out]
        soc.emit('notify', json.dumps({
            'data': json.dumps({
                'job_id': self.data["sub_id"],
                'data': out
            })
        }), broadcast=True)
