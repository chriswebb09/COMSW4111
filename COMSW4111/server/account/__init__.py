#!/usr/bin/env python3

from flask import Blueprint


bp: Blueprint = Blueprint('account', __name__)


from COMSW4111.server.main import routes
