#!/usr/bin/env python3

from flask import Blueprint

bp: Blueprint = Blueprint('create_listing', __name__)

from COMSW4111.server.create_listing import routes
