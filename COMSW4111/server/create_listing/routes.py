#!/usr/bin/env python3

from COMSW4111.server.create_listing import bp
from flask_login import login_required
from flask import render_template

@bp.route('/create_listing', methods=['GET', 'POST'])
@login_required
def create_listing():
    return render_template('listings/create_listing.html', title='Create Listing')
