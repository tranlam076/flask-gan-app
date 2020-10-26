from server import app, root_dir
from flask import send_from_directory
import os


@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    template_dir = root_dir + os.path.sep + 'templates'
    print(template_dir)
    print(path)
    return send_from_directory(template_dir, path)

#
# @app.route('/index.html', methods=['GET'])
# def get_static_proxy(path):
#     template_dir = root_dir + '\\templates'
#     print(template_dir)
#     print(path)
#     return send_from_directory(template_dir, path)
