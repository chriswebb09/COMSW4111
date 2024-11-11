#!/usr/bin/env python3

from COMSW4111.server.create_listing import bp

from flask import render_template, session, request, redirect, json, jsonify

@bp.route('/create_listing', methods=['GET', 'POST'])
def create_listing():
    if request.method == "POST":
        print(request.form)
    return render_template('create_listing.html', title='Create Listing')
