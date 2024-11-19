from flask import Blueprint, request, jsonify, render_template, current_app
from flask_login import login_required, current_user
from datetime import datetime
from sqlalchemy import exc, and_, desc
from COMSW4111.data_models import PRUser
from COMSW4111.data_models import db, Account
from COMSW4111.data_models.transaction import Transaction
from COMSW4111.data_models.buyer import Buyer
from COMSW4111.data_models.listing import Listing
from COMSW4111.server.transactions import bp
import uuid

@bp.route('/transaction', methods=['GET'])
@login_required
def begin_transaction():
    listing_id = request.args.get('listing_id')
    return render_template('transaction.html', title='Transaction' , listing_id=listing_id)


@bp.route('/transactions_list', methods=['GET'])
@login_required
def transaction_list():
    return render_template('transactions.html', title='Transaction')

@bp.route('/api/transaction', methods=['POST'])
@login_required
def post_new_transaction():
    data = request.get_json()
    print(data)
    error_description = ""
    try:
        listing = Listing.query.filter_by(listing_id=data['listing_id']).first()
        account = Account.query.filter_by(user_id=current_user.user_id).first()
        transaction_user = PRUser.query.get(current_user.user_id)
        transactions = Transaction.query.filter(and_(Transaction.listing_id == data['listing_id'], Transaction.buyer_id == current_user.user_id)).all()
        if transactions:
            error_description = "transaction already exists"
            return jsonify({"error": f"Transactions already exist {error_description}"}), 500
        print(listing)
        if listing.seller_id == current_user.user_id:
            error_description = "cannot buy own listing"
            return jsonify({"error": f"Cannot buy your own listing {error_description}"}), 500
        if account is None:
            account = Account(
                account_id=str(uuid.uuid4()),
                user_id=current_user.user_id,
                billing_address=transaction_user.address,
            )
            db.session.add(account)
            db.session.commit()
        buyer = Buyer.query.get(current_user.user_id)
        if buyer is None:
            buyer = Buyer(buyer_id=current_user.user_id, account_id=account.account_id)
            db.session.add(buyer)
        new_transaction = Transaction(
            transaction_id=str(uuid.uuid4()),
            buyer_id=buyer.buyer_id,
            seller_id=listing.seller_id,
            listing_id=listing.listing_id,
            t_date=datetime.utcnow(),
            agreed_price=data['agreed_price'],
            serv_fee=data['serv_fee'],
            status='pending'
        )
        listing.status = 'pending'
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
        print(e)
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        print(e)
        current_app.logger.error(f"Error creating transaction: {str(e)} {error_description}")
        return jsonify({"error": f"Failed to create transaction - {str(e)} {error_description}"}), 500


@bp.route('/api/transactions', methods=['GET'])
def get_transactions():
    try:
        # Get query parameters for filtering
        buyer_id = request.args.get('buyer_id')
        seller_id = request.args.get('seller_id')
        status = request.args.get('status')
        # Start with base query
        query = Transaction.query
        # Apply filters if provided
        if buyer_id:
            query = query.filter(Transaction.buyer_id == buyer_id)
        if seller_id:
            query = query.filter(Transaction.seller_id == seller_id)
        if status:
            query = query.filter(Transaction.status == status)
        # Order by date descending by default
        query = query.order_by(desc(Transaction.t_date))
        # Execute query and get results
        transactions = query.all()
        # Convert to list of dictionaries
        transactions_list = [{
            'transaction_id': transaction.transaction_id,
            'buyer_id': transaction.buyer_id,
            'seller_id': transaction.seller_id,
            'listing_id': transaction.listing_id,
            't_date': transaction.t_date.isoformat() if transaction.t_date else None,
            'agreed_price': str(transaction.agreed_price),  # Convert Decimal to string
            'serv_fee': str(transaction.serv_fee) if transaction.serv_fee else None,  # Handle nullable field
            'status': transaction.status
        } for transaction in transactions]
        return jsonify(transactions_list)

    except Exception as e:
        print(e)
        # Log the error here if you have logging configured
        return jsonify({
            'error': 'Failed to fetch transactions',
            'message': str(e)
        }), 500


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
