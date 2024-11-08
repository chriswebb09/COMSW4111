#!/usr/bin/env python3

import sys
from pathlib import Path
from flask import Flask, request
from COMSW4111.data_models import db
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask import redirect, url_for
from flask_login import LoginManager, current_user
from COMSW4111.config import Config

file = Path(__file__).resolve()
package_root_directory = file.parents[1]
sys.path.append(str(package_root_directory))

# db = SQLAlchemy()
migrate = Migrate()

login_manager = LoginManager()
login_manager.login_view = 'auth.login'


@login_manager.user_loader
def user_loader(email):
    return


@login_manager.request_loader
def request_loader(request):
    return


def create_app(config_class=Config):
    app = Flask(__name__, template_folder="templates")
    app.config.from_object(config_class)
    db.init_app(app)
    from COMSW4111.server.main import bp as main_bp
    app.register_blueprint(main_bp)
    from COMSW4111.server.auth import bp as auth_bp
    app.register_blueprint(auth_bp)
    from COMSW4111.server.search import bp as search_bp
    app.register_blueprint(search_bp)
    from COMSW4111.server.account import bp as account_bp
    app.register_blueprint(account_bp)
    # Initialize extensions

    migrate.init_app(app, db)
    login_manager.init_app(app)


    # Create tables
    with app.app_context():
        db.create_all()
    return app
