#!/usr/bin/env python3

from flask import render_template, request, redirect, url_for, flash
from flask_login import login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash
from COMSW4111.server.auth import bp

@bp.route('/signup', methods=['POST', 'GET'])
def signup():
	return render_template('signup.html')


@bp.route('/login', methods=['POST', 'GET'])
def login():
	return render_template('login.html')