from flask import Blueprint, request, jsonify, render_template
from COMSW4111.data_models.transaction import Transaction
from COMSW4111.server.transactions import bp
from flask import current_app
from flask_login import login_required, current_user
from datetime import datetime
from COMSW4111.data_models.buyer import Buyer
from COMSW4111.data_models.listing import Listing
import uuid
from sqlalchemy import exc
from COMSW4111.data_models import db, Account


@bp.route('/transaction', methods=['GET'])
@login_required
def begin_transaction():
    return render_template('transaction.html', title='Transactions')

@bp.route('/api/transaction', methods=['POST'])
@login_required
def create_transaction():
    try:
        data = request.get_json()

        # Verify listing exists and is available
        listing = Listing.query.get(data['listing_id'])
        account = Account.query.filter_by(user_id=current_user.user_id).first()
        new_buyer = Buyer(
            buyer_id=current_user.user_id,
            account_id=account.account_id
        )

        db.session.add(new_buyer)
        db.session.commit()
        if not listing:
            return jsonify({"error": "Listing not found"}), 404

        # Create new transaction
        new_transaction = Transaction(
            transaction_id=str(uuid.uuid4()),
            buyer_id=new_buyer.buyer_id,
            seller_id=listing.seller_id,
            listing_id=data['listing_id'],
            t_date=datetime.utcnow(),
            agreed_price=data['agreed_price'],
            serv_fee=data['serv_fee'],
            status='pending'
        )

        db.session.add(new_transaction)
        db.session.commit()

        return jsonify({
            'transaction_id': new_transaction.transaction_id,
            'buyer_id': new_transaction.buyer_id,
            'seller_id': new_transaction.seller_id,
            'listing_id': new_transaction.listing_id,
            't_date': new_transaction.t_date.strftime('%Y-%m-%d'),
            'agreed_price': float(new_transaction.agreed_price),
            'serv_fee': float(new_transaction.serv_fee),
            'status': new_transaction.status
        })

    except exc.SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Error creating transaction: {str(e)}")
        return jsonify({"error": "Failed to create transaction"}), 500

@bp.route('/api/transaction/<transaction_id>', methods=['GET'])
@login_required
def get_transaction(transaction_id):
    """Fetch a specific transaction by ID"""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404
    return jsonify({
        "transaction_id": transaction.transaction_id,
        "buyer_id": transaction.buyer_id,
        "seller_id": transaction.seller_id,
        "listing_id": transaction.listing_id,
        "t_date": transaction.t_date,
        "agreed_price": transaction.agreed_price,
        "serv_fee": transaction.serv_fee,
        "status": transaction.status
    })

@bp.route('/api/transaction/update/<transaction_id>', methods=['PUT'])
@login_required
def update_transaction_status(transaction_id):
    """Update the status of a transaction"""
    data = request.json
    new_status = data.get('status')
    transaction = Transaction.query.get(transaction_id)

    if not transaction:
        return jsonify({"error": "Transaction not found"}), 404

    transaction.status = new_status
    db.session.commit()
    return jsonify({"message": "Transaction status updated", "transaction_id": transaction.transaction_id})
