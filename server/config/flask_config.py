import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'default very_secret_phrase')
    FLASK_ENV = os.environ.get('FLASK_ENV', 'default development')
    APP_NAME = os.environ.get('APP_NAME', 'default Flask_MVC')

