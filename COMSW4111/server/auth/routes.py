#!/usr/bin/env python3
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
# from werkzeug.urls import url_parse
from COMSW4111.data_models.PRUser import PRUser
from COMSW4111.data_models.PRUser import db
from datetime import datetime
from COMSW4111.server.auth import bp

@bp.route('/login', methods=['GET', 'POST'])
def login():
	if current_user.is_authenticated:
		return redirect(url_for('account.account'))

	if request.method == 'POST':
		email = request.form.get('email')
		password = request.form.get('password')
		remember = True if request.form.get('remember') else False

		user = PRUser.query.filter_by(email=email).first()

		if user and user.check_password(password):
			if user.acc_status == 'banned':
				flash('This account has been banned.', 'error')
				return redirect(url_for('auth.login'))

			if user.acc_status == 'inactive':
				flash('Please activate your account first.', 'error')
				return redirect(url_for('auth.login'))

			login_user(user, remember=remember)
			user.t_last_act = datetime.utcnow()
			db.session.commit()

			next_page = request.args.get('next')
			if not next_page or url_parse(next_page).netloc != '':
				next_page = url_for('main.home')
			return redirect(next_page)

		flash('Invalid email or password', 'error')
	return render_template('login.html')


@bp.route('/signup', methods=['GET', 'POST'])
def register():
	if current_user.is_authenticated:
		return redirect("")

	if request.method == 'POST':
		email = request.form.get('email')

		# Check if user already exists
		user = PRUser.query.filter_by(email=email).first()
		if user:
			flash('Email address already exists', 'error')
			return redirect(url_for('auth.signup'))

		# Create new user
		new_user = PRUser(
			email=email,
			first_name=request.form.get('first_name'),
			last_name=request.form.get('last_name'),
			address=request.form.get('address'),
			phone_number=request.form.get('phone_number'),
			acc_status='active'
		)
		new_user.set_password(request.form.get('password'))

		try:
			db.session.add(new_user)
			db.session.commit()
			flash('Registration successful!', 'success')
			return redirect(url_for('auth.login'))
		except Exception as e:
			db.session.rollback()
			flash('Registration failed. Please try again.', 'error')

	return render_template('signup.html')


@bp.route('/logout')
@login_required
def logout():
	logout_user()
	return redirect("account.html")

#
# from flask import render_template, request, redirect, url_for, flash
# from flask_login import login_user, login_required, logout_user, current_user
# from werkzeug.security import generate_password_hash
# from COMSW4111.server.auth import bp
#
# @bp.route('/signup', methods=['POST', 'GET'])
# def signup():
# 	return render_template('signup.html', title="Sign Up")
#
#
# @bp.route('/login', methods=['POST', 'GET'])
# def login():
# 	return render_template('login.html', title="Login")