#!/usr/bin/env python3

from flask import Blueprint


bp: Blueprint = Blueprint('main', __name__)


from COMSW4111.server.main import routes
