#!/usr/bin/env python3

from flask import jsonify, request, current_app, session, render_template
from flask_login import login_required, current_user
from COMSW4111.data_models import db
from COMSW4111.data_models import PRUser
from COMSW4111.data_models import Admin
from COMSW4111.server.admin import bp