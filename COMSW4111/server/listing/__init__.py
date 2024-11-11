#!/usr/bin/env python3

from flask import Blueprint

bp: Blueprint = Blueprint('listing', __name__)

from COMSW4111.server.listing import routes