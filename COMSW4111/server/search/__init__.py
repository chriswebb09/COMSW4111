#!/usr/bin/env python3

from flask import Blueprint


bp: Blueprint = Blueprint('search', __name__)


from COMSW4111.server.search import routes
