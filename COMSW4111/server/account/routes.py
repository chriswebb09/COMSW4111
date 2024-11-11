#!/usr/bin/env python3

from flask import jsonify, request, current_app, session, render_template
from flask_login import login_required, current_user
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from COMSW4111.data_models import db
from COMSW4111.data_models import PRUser
from COMSW4111.data_models import Account
from COMSW4111.data_models import BankAccount
from COMSW4111.data_models import CreditCard
from COMSW4111.data_models import Buyer
from COMSW4111.data_models import Seller
from COMSW4111.server.app import check_account_status
from COMSW4111.server.account import bp

@bp.route('/api/account/profile', methods=['GET'])
# @login_required
# @check_account_status
def get_profile():
    """Get user profile information"""
    try:
        user = PRUser.query.get(current_user.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_data = {
            'user_id': user.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'address': user.address,
            'phone_number': user.phone_number,
            't_created': user.t_created.isoformat(),
            't_last_act': user.t_last_act.isoformat(),
            'acc_status': user.acc_status,
            'roles': {
                'is_seller': bool(user.seller),
                'is_buyer': bool(user.buyer),
                'is_admin': bool(user.admin)
            }
        }
        return jsonify(user_data), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account/profile', methods=['PUT'])
# @login_required
# @check_account_status
def update_profile():
    """Update user profile information"""
    try:
        data = request.get_json()
        print(current_user.user_id)
        user = PRUser.query.get(current_user.user_id)

        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Update fields if provided
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'address' in data:
            user.address = data['address']
        if 'phone_number' in data:
            user.phone_number = data['phone_number']

        user.t_last_act = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Profile updated successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error updating profile: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        current_app.logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account/payment-methods', methods=['GET'])
@login_required
@check_account_status
def get_payment_methods():
    """Get user's payment methods"""
    try:
        accounts = Account.query.filter_by(user_id=current_user.user_id).all()
        payment_methods = []

        for account in accounts:
            method = {
                'account_id': account.account_id,
                'account_type': account.account_type,
                'billing_address': account.billing_address
            }

            if account.account_type == 'bank_account' and account.bank_account:
                method['details'] = {
                    'bank_acc_num': f"****{account.bank_account.bank_acc_num[-4:]}",
                    'routing_num': f"****{account.bank_account.routing_num[-4:]}"
                }
            elif account.account_type == 'credit_card' and account.credit_card:
                method['details'] = {
                    'cc_num': f"****{account.credit_card.cc_num[-4:]}",
                    'exp_date': account.credit_card.exp_date.strftime('%m/%y')
                }

            payment_methods.append(method)

        return jsonify(payment_methods), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching payment methods: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account/payment-methods', methods=['POST'])
@login_required
@check_account_status
def add_payment_method():
    """Add a new payment method"""
    try:
        data = request.get_json()

        new_account = Account(
            user_id=current_user.user_id,
            account_type=data['account_type'],
            billing_address=data['billing_address']
        )

        db.session.add(new_account)
        db.session.flush()  # Get the account_id

        if data['account_type'] == 'bank_account':
            bank_account = BankAccount(
                account_id=new_account.account_id,
                bank_acc_num=data['bank_acc_num'],
                routing_num=data['routing_num']
            )
            db.session.add(bank_account)

        elif data['account_type'] == 'credit_card':
            credit_card = CreditCard(
                account_id=new_account.account_id,
                cc_num=data['cc_num'],
                exp_date=datetime.strptime(data['exp_date'], '%m/%y').date()
            )
            db.session.add(credit_card)

        db.session.commit()
        return jsonify({'message': 'Payment method added successfully'}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error adding payment method: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        current_app.logger.error(f"Error adding payment method: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account/payment-methods/<int:account_id>', methods=['DELETE'])
@login_required
@check_account_status
def delete_payment_method(account_id):
    """Delete a payment method"""
    try:
        account = Account.query.filter_by(
            account_id=account_id,
            user_id=current_user.user_id
        ).first()

        if not account:
            return jsonify({'error': 'Payment method not found'}), 404

        db.session.delete(account)
        db.session.commit()

        return jsonify({'message': 'Payment method deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting payment method: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account/seller-status', methods=['GET'])
@login_required
@check_account_status
def get_seller_status():
    """Get seller dashboard information"""
    try:
        seller = Seller.query.filter_by(seller_id=current_user.user_id).first()
        if not seller:
            return jsonify({'error': 'Not a seller'}), 404

        # Get seller statistics
        stats = {
            'total_listings': len(seller.listings),
            'active_listings': sum(1 for listing in seller.listings if listing.status == 'active'),
            'total_transactions': len(seller.transactions),
            'total_revenue': sum(t.agreed_price for t in seller.transactions if t.status == 'completed'),
            'avg_rating': 4.5  # This would come from a ratings system
        }

        return jsonify(stats), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching seller status: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account/buyer-status', methods=['GET'])
@login_required
@check_account_status
def get_buyer_status():
    """Get buyer dashboard information"""
    try:
        buyer = Buyer.query.filter_by(buyer_id=current_user.user_id).first()
        if not buyer:
            return jsonify({'error': 'Not a buyer'}), 404

        # Get buyer statistics
        stats = {
            'total_purchases': len(buyer.transactions),
            'active_transactions': sum(1 for t in buyer.transactions if t.status == 'pending'),
            'completed_transactions': sum(1 for t in buyer.transactions if t.status == 'completed'),
            'total_spent': sum(t.agreed_price for t in buyer.transactions if t.status == 'completed')
        }

        return jsonify(stats), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching buyer status: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account/password', methods=['PUT'])
@login_required
@check_account_status
def change_password():
    """Change user password"""
    try:
        data = request.get_json()
        user = PRUser.query.get(current_user.user_id)

        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Current password is incorrect'}), 400

        user.set_password(data['new_password'])
        user.t_last_act = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error changing password: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@bp.route('/api/account', methods=['DELETE'])
@login_required
def delete_account():
    """Delete user account"""
    try:
        data = request.get_json()
        user = PRUser.query.get(current_user.user_id)

        if not user.check_password(data['password']):
            return jsonify({'error': 'Password is incorrect'}), 400

        # Set account status to inactive instead of deleting
        user.acc_status = 'inactive'
        user.t_last_act = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Account deactivated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deactivating account: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/account', methods=['GET', 'POST'])
def account():
    return render_template('account.html', title='Account')
