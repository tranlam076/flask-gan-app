from server import root_dir
import json
from flask import request, Response
from werkzeug.utils import secure_filename
import time
from server.helpers import thread_handler
import cv2
import numpy as np
import face_recognition
import os
import shutil


def clean_files():
    file_path = os.path.join(root_dir, 'templates', 'files')
    shutil.rmtree(file_path)
    output = os.path.join(root_dir, 'templates', 'files', 'output')
    if not os.path.exists(output):
        os.makedirs(output)


def un_sharp_mask(image, kernel_size=(3, 3), sigma=100, amount=1.5, threshold=0):
    """Return a sharpened version of the image, using an unsharp mask."""
    blurred = cv2.GaussianBlur(image, kernel_size, sigma)
    sharpened = float(amount + 1) * image - float(amount) * blurred
    sharpened = np.maximum(sharpened, np.zeros(sharpened.shape))
    sharpened = np.minimum(sharpened, 255 * np.ones(sharpened.shape))
    sharpened = sharpened.round().astype(np.uint8)
    if threshold > 0:
        low_contrast_mask = np.absolute(image - blurred) < threshold
        np.copyto(sharpened, image, where=low_contrast_mask)
    return sharpened


def more_contrast(img):
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=1.0, tileGridSize=(8, 8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl, a, b))
    final = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    return final


def save_file():
    f = request.files['file']
    domain = request.form['domain']
    is_merge = request.form['is_merge']
    print(domain, is_merge)
    file_name = str(time.time()) + secure_filename(f.filename)
    file_path = os.path.join(root_dir, "templates", "files", file_name)
    f.save(file_path)

    img = cv2.imread(file_path)
    img = more_contrast(img)
    imgS = cv2.cvtColor(img.copy(), cv2.COLOR_BGR2RGB)
    facesCurFrame = face_recognition.face_locations(imgS)
    if len(facesCurFrame) > 0:
        faceLoc = facesCurFrame[0]
        y1, x2, y2, x1 = faceLoc
        width = x2 - x1
        height = y2 - y1
        x1 = max(x1 - width//4, 0)
        y1 = max(y1 - height//2, 0)
        x2 = min(x2 + width//4, imgS.shape[1])
        y2 = min(y2 + height//3, imgS.shape[0])
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


clean_files()
