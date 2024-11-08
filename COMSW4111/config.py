import os


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = SQLALCHEMY_DATABASE_URI = ('postgresql://christopherwebb:Berkeley1990@127.0.0.1:5432/MarketDB')
        # ('postgresql://christopherwebb:Berkeley1990@localhost/prmarketplace')
                               # postgresql://christopherwebb:Berkeley1990@127.0.0.1:5432')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    LANGUAGES = ['en', 'es']
    # Statement for enabling the development environment
    DEBUG = True
    # Define the application directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
