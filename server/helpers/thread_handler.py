from server.helpers import gan_faces_process


def file_process(data_passing, sub_id):
    face_p = gan_faces_process.face_detect_thread({
        "sub_id": sub_id,
        "params": data_passing
    })
    face_p.start()
