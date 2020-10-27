from server import app, soc
from server.config import get_config
app_config = get_config.get_config()

if __name__ == '__main__':
    app.run(host=app_config["HOST"], port=app_config["PORT"], debug=app_config["DEBUG_STATUS"])
