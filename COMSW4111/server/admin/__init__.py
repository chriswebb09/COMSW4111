#!/usr/bin/env python3

from flask import Blueprint

bp = Blueprint('admin', __name__)

from COMSW4111.server.admin import routes