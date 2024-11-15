#!/usr/bin/env python3

import sys
from pathlib import Path
from flask import Flask, request
from COMSW4111.data_models import db
from flask_migrate import Migrate
from COMSW4111.data_models import PRUser
from flask_login import LoginManager, current_user
from COMSW4111.config import Config

file = Path(__file__).resolve()
package_root_directory = file.parents[1]
sys.path.append(str(package_root_directory))
migrate = Migrate()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'

@login_manager.request_loader
def load_user_from_request(request):
    auth_str = request.headers.get('Authorization')
    token = auth_str.split(' ')[1] if auth_str else ''
    if token:
        user_id = PRUser.decode_token(token)
        user = PRUser.query.get(user_id)
        if user:
            return user
    return None

@login_manager.user_loader
def load_user(id):
    return PRUser.query.get(id)

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
    from COMSW4111.server.create_listing import bp as create_listing_bp
    app.register_blueprint(create_listing_bp)
    from COMSW4111.server.listing import bp as listing_bp
    app.register_blueprint(listing_bp)
    from COMSW4111.server.transactions import bp as transactions_bp
    app.register_blueprint(transactions_bp)
    from COMSW4111.server.dispute import bp as dispute_bp
    app.register_blueprint(dispute_bp)
    from COMSW4111.server.admin import bp as admin_bp
    app.register_blueprint(admin_bp)
    # Initialize extensions
    migrate.init_app(app, db)
    login_manager.init_app(app)
    # Create tables
    with app.app_context():
        db.create_all()
    return app
