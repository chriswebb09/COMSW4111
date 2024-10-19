#!/usr/bin/env python3

from flask import Blueprint

bp = Blueprint('auth', __name__)

from COMSW4111.server.auth import routes