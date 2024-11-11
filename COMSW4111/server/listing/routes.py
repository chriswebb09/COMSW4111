#!/usr/bin/env python3

from COMSW4111.server.listing import bp

from flask import render_template, session, request, redirect, json, jsonify

@bp.route('/listing', methods=['GET', 'POST'])
def listing():
    return render_template('listing.html', title='Listing')