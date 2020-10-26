from server import root_dir
import json
from flask import request, Response
from werkzeug.utils import secure_filename
import time
from server.helpers import thread_handler
import cv2
import face_recognition
import os


def save_file():
    f = request.files['file']
    domain = request.form['domain']
    is_merge = request.form['is_merge']
    print(domain, is_merge)
    file_name = secure_filename(f.filename)
    file_path = os.path.join(root_dir, "templates", "files", file_name)
    f.save(file_path)

    img = cv2.imread(file_path)
    imgS = cv2.cvtColor(img.copy(), cv2.COLOR_BGR2RGB)
    facesCurFrame = face_recognition.face_locations(imgS)
    if len(facesCurFrame) > 0:
        faceLoc = facesCurFrame[0]
        y1, x2, y2, x1 = faceLoc
        width = x2 - x1
        height = y2 - y1
        x1 = max(x1 - width, 0)
        y1 = max(y1 - height, 0)
        x2 = min(x2 + width, imgS.shape[1])
        y2 = min(y2 + height, imgS.shape[0])
        # y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
        img = img[y1:y2, x1:x2]
        cv2.imwrite(file_path, img)

    sub_id = "id" + str(time.time())
    #
    thread_handler.file_process({
        "filename": file_name,
        "domain": domain,
        "is_merge": is_merge
    }, sub_id)
    return Response(json.dumps({
        'status': 'ok',
        'message': 'file saved at ' + file_path,
        'data': {
            'job_id': sub_id
        }
    }), status=200, mimetype='application/json')

