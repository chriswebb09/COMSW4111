from flask import Blueprint, request, jsonify, render_template
from COMSW4111.data_models import db
from COMSW4111.data_models.transaction import Transaction
from COMSW4111.server.transactions import bp

@bp.route('/transaction', methods=['GET'])
def begin_transaction():
    return render_template('transaction.html', title='Transactions')

@bp.route('/api/transaction/start', methods=['POST'])
def start_transaction():
    """Endpoint to initiate a new transaction"""
    data = request.json
    buyer_id = data.get('buyer_id')
    seller_id = data.get('seller_id')
    listing_id = data.get('listing_id')
    agreed_price = data.get('agreed_price')
    serv_fee = data.get('serv_fee')

    if not all([buyer_id, seller_id, listing_id, agreed_price]):
        return jsonify({"error": "Missing required transaction details"}), 400

    new_transaction = Transaction(
        transaction_id=str(uuid4()),
        buyer_id=buyer_id,
        seller_id=seller_id,
        listing_id=listing_id,
        t_date=datetime.utcnow(),
        agreed_price=agreed_price,
        serv_fee=serv_fee,
        status='pending'
    )
    db.session.add(new_transaction)
    db.session.commit()

    return jsonify({"message": "Transaction started", "transaction_id": new_transaction.transaction_id}), 201

@bp.route('/api/transaction/<transaction_id>', methods=['GET'])
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
