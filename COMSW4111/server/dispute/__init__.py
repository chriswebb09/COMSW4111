#!/usr/bin/env python3

from flask import Blueprint

bp: Blueprint = Blueprint('dispute', __name__)

from COMSW4111.server.listing import routes