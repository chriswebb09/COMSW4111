#!/usr/bin/env python3

import requests
from flask import render_template, session, request, redirect, json, jsonify
from COMSW4111.server.main import bp
from flask_login import LoginManager, current_user

@bp.before_app_request
def before_request():
    if current_user.is_authenticated:
        pass
    else:
        pass


@bp.route('/', methods=['GET', 'POST'])
def home():
    return render_template('index.html', title='Home')
