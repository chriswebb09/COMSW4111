#!/usr/bin/env python3

import sys
from pathlib import Path
from flask import Flask, request
from flask import redirect, url_for
from flask_login import LoginManager, current_user
from COMSW4111.config import Config

file = Path(__file__).resolve()
package_root_directory = file.parents[1]
sys.path.append(str(package_root_directory))

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
    from COMSW4111.server.main import bp as main_bp
    app.register_blueprint(main_bp)
    from COMSW4111.server.auth import bp as auth_bp
    app.register_blueprint(auth_bp)
    login_manager.init_app(app)
    app.config.from_object(config_class)
    return app
