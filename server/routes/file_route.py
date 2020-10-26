from server import app
from server.controllers import file_controller


@app.route('/upload', methods=['POST'])
def upload_file():
    return file_controller.save_file()
