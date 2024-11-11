#!/usr/bin/env python3

import requests
from flask import render_template, session, request, redirect, json, jsonify
from COMSW4111.server.search import bp
from flask_login import LoginManager, current_user

@bp.route('/search', methods=['GET', 'POST'])
def search():
    return render_template('search.html', title='Search')
