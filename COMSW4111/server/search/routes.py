#!/usr/bin/env python3

from flask import render_template
from COMSW4111.server.search import bp
from flask_login import login_required

@bp.route('/search', methods=['GET', 'POST'])
@login_required
def search():
    return render_template('search.html', title='Search')
