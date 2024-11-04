import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = ('postgres://name:password@localhost:5432/prmarketplace')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LANGUAGES = ['en', 'es']
    # Statement for enabling the development environment
    DEBUG = True
    # Define the application directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
