import threading
import json
from server import root_dir, soc
from server.gan import load_gan
import os

gan = load_gan.load_model()


class face_detect_thread(threading.Thread):

    def __init__(self, data):
        super().__init__()
        self.data = data  # Initialize data for thread
        print(data)

    def run(self):
        global gan
        file_path = os.path.join(root_dir, 'templates', 'files') + os.path.sep
        source = file_path + self.data["params"]["source"]
        refer = file_path + self.data["params"]["refer"]
        output = os.path.join(root_dir, 'templates', 'files', 'output') + os.path.sep
        domain = self.data["params"]["domain"].split(",")
        domain = [int(x) for x in domain]
        print(self.data)
        mode = self.data["params"]["mode"]
        num_of_style = self.data["params"]["num_of_style"]
        res = []
        if mode == "refer":
            num_of_style = 1

        for i in range(0, int(num_of_style)):
            out = gan.test(destination_path=output, src_img_path=source, ref_img_path=refer,
                           ref_img_domains=domain, mode_=mode)
            res.append(["output/" + x for x in out])

        soc.emit('notify', json.dumps({
            'data': json.dumps({
                'job_id': self.data["sub_id"],
                'data': res
            })
        }), broadcast=True)
