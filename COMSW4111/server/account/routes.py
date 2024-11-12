#!/usr/bin/env python3

from flask import jsonify, request, current_app, session, render_template
from flask_login import login_required, current_user
from datetime import datetime
import uuid
from sqlalchemy.exc import SQLAlchemyError
from COMSW4111.data_models import db
from COMSW4111.data_models import PRUser
from COMSW4111.data_models import Account
from COMSW4111.data_models import BankAccount
from COMSW4111.data_models import CreditCard
from COMSW4111.data_models import Buyer
from COMSW4111.data_models import Seller
from COMSW4111.server.app import check_account_status
from COMSW4111.data_models import Transaction
from COMSW4111.data_models import Listing
from COMSW4111.server.account import bp
from sqlalchemy import func
from sqlalchemy import desc


@bp.route('/api/account/profile', methods=['GET'])
@login_required
@check_account_status
def get_profile():
    try:
        user = PRUser.query.get(current_user.user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        accounts_data = get_user_accounts(user.user_id)
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
            'accounts': accounts_data,
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
@login_required
@check_account_status
def update_profile():
    """Update user profile information"""
    try:
        data = request.get_json()
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
        query = db.session.query(Account, BankAccount, CreditCard).outerjoin(
            BankAccount, Account.account_id == BankAccount.account_id
        ).outerjoin(
            CreditCard, Account.account_id == CreditCard.account_id
        ).filter(
            Account.user_id == current_user.user_id
        )

        payment_methods = [
            {
                'account_id': account.account_id,
                'account_type': account.account_type,
                'billing_address': account.billing_address,
                'details': {
                    'bank_acc_num': f"****{bank_account.bank_acc_num}",
                    'routing_num': f"****{bank_account.routing_num}"
                } if account.account_type == 'bank_account' and bank_account else {
                    'cc_num': f"****{credit_card.cc_num}",
                    'exp_date': credit_card.exp_date
                } if account.account_type == 'credit_card' and credit_card else None
            }
            for account, bank_account, credit_card in query.all()
        ]

        return jsonify(payment_methods), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching payment methods: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


def add_credit_card(account_id, cc_num):
    user = PRUser.query.get(current_user.user_id)
    new_account = Account(
        account_id=str(uuid.uuid4()),
        user_id=current_user.user_id,
        billing_address=user.address,
        account_type='credit_card'
    )
    db.session.add(new_account)
    db.session.flush()

    new_credit_card = CreditCard(
        account_id=new_account.account_id,
        cc_num=cc_num,
        exp_date=datetime.strptime('24052010', '%d%m%Y').date()
    )

    db.session.add(new_credit_card)
    db.session.commit()
    session['anonymous_user_id'] = current_user.user_id
    print(f"Credit card for account {account_id} added successfully.")


def add_bank_account(account_id, bank_account_num, routing_num):
    user = PRUser.query.get(current_user.user_id)
    new_account = Account(
        account_id=str(uuid.uuid4()),
        user_id=current_user.user_id,
        billing_address=user.address,
        account_type='bank_account'
    )
    db.session.add(new_account)
    db.session.flush()

    new_bank_account = BankAccount(
        account_id=new_account.account_id,
        bank_acc_num=bank_account_num,
        routing_num=routing_num
    )

    db.session.add(new_bank_account)
    db.session.commit()
    session['anonymous_user_id'] = current_user.user_id
    print(f"Bank account for account {account_id} added successfully.")


@bp.route('/api/account/payment-methods', methods=['POST'])
@login_required
@check_account_status
def add_payment_method():
    """Add a new payment method"""
    try:
        data = request.get_json()
        account = Account(
            user_id=current_user.user_id,
            account_type=data['account_type'],
            billing_address=data['billing_address']
        )
        account.account_id = str(uuid.uuid4())
        db.session.add(account)
        db.session.flush()  # Get the account_id
        if data['account_type'] == 'bank_account':
            add_bank_account(account.account_id, data['bank_acc_num'], data['routing_num'])
        elif data['account_type'] == 'credit_card':
            add_credit_card(account.account_id, data['cc_num'])
        return jsonify({'message': 'Payment method added successfully'}), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error adding payment method: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        current_app.logger.error(f"Error adding payment method: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


def get_user_credit_cards(user_id):
    try:
        # Query credit cards joined with accounts for a specific user
        credit_cards = CreditCard.query \
            .join(Account, CreditCard.account_id == Account.account_id) \
            .filter(Account.user_id == user_id) \
            .all()
        cards_data = []
        for card in credit_cards:
            card_info = {
                'credit_card_id': card.credit_card_id,
                'account_id': card.account_id,
                'cc_num': f"****{card.cc_num}",  # Mask credit card number
                'exp_date': card.exp_date if card.exp_date else None
            }
            cards_data.append(card_info)
        return cards_data

    except Exception as e:
        print(f"Error fetching credit cards: {str(e)}")
        return None


@bp.route('/api/account/payment-methods/<string:account_id>', methods=['DELETE'])
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

@bp.route('/api/account/seller_status', methods=['GET'])
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


@bp.route('/api/account/buyer_status', methods=['GET'])
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


@bp.route('/api/account', methods=['GET'])
@login_required
def get_accounts():
    Account.query.filter_by(user_id=current_user.user_id).all()
    accounts = get_user_accounts(current_user.user_id)
    return jsonify({'accounts': accounts}), 200


from sqlalchemy import case, or_
from datetime import datetime

def get_user_accounts(user_id):
    # Subqueries for each account type's details
    bank_details = (
        BankAccount.query
        .with_entities(
            BankAccount.account_id,
            BankAccount.bank_acc_num.label('bank_acc_num'),
            BankAccount.routing_num.label('routing_num')
        )
        .subquery()
    )

    credit_details = (
        CreditCard.query
        .with_entities(
            CreditCard.account_id,
            CreditCard.cc_num.label('cc_num'),
            CreditCard.exp_date.label('exp_date')
        )
        .subquery()
    )

    # Main query with conditional joins
    accounts = (
        Account.query
        .outerjoin(bank_details,
                   (Account.account_id == bank_details.c.account_id) &
                   (Account.account_type == 'bank_account'))
        .outerjoin(credit_details,
                   (Account.account_id == credit_details.c.account_id) &
                   (Account.account_type == 'credit_card'))
        .with_entities(
            Account.account_id,
            Account.account_type,
            Account.billing_address,
            bank_details.c.bank_acc_num,
            bank_details.c.routing_num,
            credit_details.c.cc_num,
            credit_details.c.exp_date
        )
        .filter(Account.user_id == user_id)
        .all()
    )

    # Transform query results into the desired format
    accounts_data = []
    for account in accounts:
        account_info = {
            'account_id': account.account_id,
            'account_type': account.account_type,
            'billing_address': account.billing_address,
            'details': None
        }

        if account.account_type == 'bank_account' and account.bank_acc_num:
            account_info['details'] = {
                'bank_acc_num': f"****{account.bank_acc_num[-4:]}",
                'routing_num': f"****{account.routing_num[-4:]}"
            }
        elif account.account_type == 'credit_card' and account.cc_num:
            account_info['details'] = {
                'cc_num': f"****{account.cc_num[-4:]}",
                'exp_date': (account.exp_date or datetime.utcnow()).strftime('%m/%Y')
            }

        accounts_data.append(account_info)

    return accounts_data


@bp.route('/api/account/seller_list', methods=['GET'])
@login_required
def get_seller_list():
    try:
        # Verify user has a seller account
        seller = current_user.seller
        if not seller:
            return jsonify({"error": "User is not a seller"}), 403

        # Get all transactions where user is the seller
        transactions = db.session.query(
            Transaction,
            Listing.title.label('listing_title'),
            Listing.list_image.label('listing_image')
        ).join(
            Listing, Transaction.listing_id == Listing.listing_id
        ).filter(
            Transaction.seller_id == seller.seller_id
        ).order_by(
            desc(Transaction.t_date)
        ).all()

        # Calculate summary statistics
        stats = db.session.query(
            func.count(Transaction.transaction_id).label('total_transactions'),
            func.sum(Transaction.agreed_price).label('total_sales'),
            func.sum(Transaction.serv_fee).label('total_fees')
        ).filter(
            Transaction.seller_id == seller.seller_id,
            Transaction.status == 'completed'
        ).first()

        # Calculate transactions per listing
        sales_by_listing = db.session.query(
            Listing.listing_id,
            Listing.title,
            func.count(Transaction.transaction_id).label('sale_count'),
            func.sum(Transaction.agreed_price).label('total_amount')
        ).join(
            Transaction, Listing.listing_id == Transaction.listing_id
        ).filter(
            Transaction.seller_id == seller.seller_id,
            Transaction.status == 'completed'
        ).group_by(
            Listing.listing_id,
            Listing.title
        ).all()

        transaction_data = {
            "summary": {
                "total_transactions": stats.total_transactions or 0,
                "total_sales": float(stats.total_sales or 0),
                "total_fees": float(stats.total_fees or 0),
                "net_earnings": float((stats.total_sales or 0) - (stats.total_fees or 0))
            },
            "transactions": [{
                "transaction_id": tx.Transaction.transaction_id,
                "date": tx.Transaction.t_date.strftime("%Y-%m-%d") if tx.Transaction.t_date else None,
                "listing_id": tx.Transaction.listing_id,
                "listing_title": tx.listing_title,
                "listing_image": tx.listing_image,
                "price": float(tx.Transaction.agreed_price),
                "service_fee": float(tx.Transaction.serv_fee) if tx.Transaction.serv_fee else 0,
                "net_amount": float(tx.Transaction.agreed_price) - float(tx.Transaction.serv_fee or 0),
                "status": tx.Transaction.status
            } for tx in transactions],
            "sales_by_listing": [{
                "listing_id": item.listing_id,
                "listing_title": item.title,
                "total_sales": item.sale_count,
                "total_amount": float(item.total_amount or 0)
            } for item in sales_by_listing]
        }

        # Group transactions by status
        status_counts = {
            'pending': 0,
            'confirming': 0,
            'confirmed': 0,
            'completed': 0
        }

        for tx in transactions:
            status_counts[tx.Transaction.status] = status_counts.get(tx.Transaction.status, 0) + 1

        transaction_data['status_summary'] = status_counts

        return jsonify(transaction_data)

    except Exception as e:
        current_app.logger.error(f"Error in get_seller_transactions: {str(e)}")
        return jsonify({"error": "Failed to fetch seller transactions"}), 500


@bp.route('/api/account/buyer_list', methods=['GET'])
@login_required
def get_buyer_transactions():
    try:
        # Verify user has a buyer account
        buyer = current_user.buyer
        if not buyer:
            return jsonify({"error": "User is not a buyer"}), 403

        # Get all transactions where user is the buyer
        transactions = db.session.query(
            Transaction,
            Listing.title.label('listing_title'),
            Listing.list_image.label('listing_image')
        ).join(
            Listing, Transaction.listing_id == Listing.listing_id
        ).filter(
            Transaction.buyer_id == buyer.buyer_id
        ).order_by(
            desc(Transaction.t_date)
        ).all()

        # Calculate some summary statistics
        stats = db.session.query(
            func.count(Transaction.transaction_id).label('total_transactions'),
            func.sum(Transaction.agreed_price).label('total_spent'),
            func.sum(Transaction.serv_fee).label('total_fees')
        ).filter(
            Transaction.buyer_id == buyer.buyer_id,
            Transaction.status == 'completed'
        ).first()

        transaction_data = {
            "summary": {
                "total_transactions": stats.total_transactions or 0,
                "total_spent": float(stats.total_spent or 0),
                "total_fees": float(stats.total_fees or 0)
            },
            "transactions": [{
                "transaction_id": tx.Transaction.transaction_id,
                "date": tx.Transaction.t_date.strftime("%Y-%m-%d") if tx.Transaction.t_date else None,
                "listing_id": tx.Transaction.listing_id,
                "listing_title": tx.listing_title,
                "listing_image": tx.listing_image,
                "price": float(tx.Transaction.agreed_price),
                "service_fee": float(tx.Transaction.serv_fee) if tx.Transaction.serv_fee else 0,
                "total_amount": float(tx.Transaction.agreed_price) + float(tx.Transaction.serv_fee or 0),
                "status": tx.Transaction.status
            } for tx in transactions]
        }

        # Group transactions by status
        status_counts = {
            'pending': 0,
            'confirming': 0,
            'confirmed': 0,
            'completed': 0
        }

        for tx in transactions:
            status_counts[tx.Transaction.status] = status_counts.get(tx.Transaction.status, 0) + 1

        transaction_data['status_summary'] = status_counts

        return jsonify(transaction_data)

    except Exception as e:
        current_app.logger.error(f"Error in get_buyer_transactions: {str(e)}")
        return jsonify({"error": "Failed to fetch buyer transactions"}), 500



@bp.route('/account', methods=['GET', 'POST'])
@login_required
def account():
    return render_template('account.html', title='Account')
