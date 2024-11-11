#!/usr/bin/env python3

from flask import render_template
from COMSW4111.server.main import bp

@bp.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html', title='Home')
