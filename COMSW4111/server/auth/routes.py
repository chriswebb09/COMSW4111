#!/usr/bin/env python3
from flask import render_template, redirect, url_for, flash, request, session
from flask_login import login_user, logout_user, login_required, current_user
import uuid
from COMSW4111.data_models import PRUser
from COMSW4111.data_models import Account
from COMSW4111.data_models import db
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
			session.pop('id', None)
			if user.acc_status == 'banned':
				flash('This account has been banned.', 'error')
				return redirect(url_for('auth.login'))
			if user.acc_status == 'inactive':
				flash('Please activate your account first.', 'error')
				return redirect(url_for('auth.login'))
			login_user(user, remember=remember)
			session['id'] = user.user_id
			user.t_last_act = datetime.utcnow()
		flash('Invalid email or password', 'error')
	return render_template('auth/login.html')


@bp.route('/signup', methods=['GET', 'POST'])
def register():
	if current_user.is_authenticated:
		return redirect("")
	if request.method == 'POST':
		email = request.form.get('email')
		user = PRUser.query.filter_by(email=email).first()
		if user:
			flash('Email address already exists', 'error')
			return redirect(url_for('auth.register'))
		new_id = str(uuid.uuid4())
		# Create new user
		new_user: PRUser = PRUser(
			user_id=new_id,
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
			session["id"] = new_id
			login_user(new_user, remember=True)
			return redirect(url_for('auth.login'))
		except Exception as e:
			print(e)
			db.session.rollback()
			flash('Registration failed. Please try again.', 'error')

	return render_template('auth/signup.html')


@bp.route('/logout')
@login_required
def logout():
	logout_user()
	session.pop('id', None)
	return redirect(url_for('auth.login'))
