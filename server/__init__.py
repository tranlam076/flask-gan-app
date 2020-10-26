__version__ = '0.1'
from flask import Flask
import os
from flask_socketio import SocketIO
from server.config import get_config
from server.config import flask_config

root_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)))

app_config = get_config.get_config()
app = Flask(__name__)
app.config.from_object(flask_config)
soc = SocketIO(app)

import server.routes
