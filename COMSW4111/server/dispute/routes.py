#!/usr/bin/env python3

from COMSW4111.server.dispute import bp
from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime
import uuid
from sqlalchemy import exc
from COMSW4111.data_models import db
from COMSW4111.data_models.transaction import Transaction
from COMSW4111.data_models.dispute import Dispute
from COMSW4111.data_models.listing import Listing
from COMSW4111.data_models.admin import Admin


@bp.route('/dispute', methods=['GET'])
def get_disputed_transactions():
    return render_template('dispute.html', title='Dispute')

# Helper function to generate unique IDs
def generate_unique_id(prefix):
    return f"{prefix}-{str(uuid.uuid4())[:8]}"


@bp.route('/api/transactions', methods=['GET'])
@login_required
def get_transactions():
    try:
        # Get transactions based on user role
        if current_user.buyer:
            transactions = Transaction.query.filter_by(buyer_id=current_user.buyer.buyer_id).all()
        elif current_user.seller:
            transactions = Transaction.query.filter_by(seller_id=current_user.seller.seller_id).all()
        else:
            return jsonify({"error": "User is neither buyer nor seller"}), 400

        transactions_list = []
        for t in transactions:
            transactions_list.append({
                'transaction_id': t.transaction_id,
                'buyer_id': t.buyer_id,
                'seller_id': t.seller_id,
                'listing_id': t.listing_id,
                't_date': t.t_date.strftime('%Y-%m-%d'),
                'agreed_price': float(t.agreed_price),
                'serv_fee': float(t.serv_fee) if t.serv_fee else 0,
                'status': t.status
            })

        return jsonify(transactions_list)

    except Exception as e:
        current_app.logger.error(f"Error fetching transactions: {str(e)}")
        return jsonify({"error": "Failed to fetch transactions"}), 500




# Dispute routes
disputes_bp = Blueprint('disputes', __name__)


@bp.route('/api/disputes', methods=['GET'])
@login_required
def get_disputes():
    try:
        if current_user.admin:
            # Admins can see all disputes
            disputes = Dispute.query.all()
        else:
            # Users can only see disputes related to their transactions
            if current_user.buyer:
                transactions = Transaction.query.filter_by(buyer_id=current_user.buyer.buyer_id).all()
            elif current_user.seller:
                transactions = Transaction.query.filter_by(seller_id=current_user.seller.seller_id).all()
            else:
                return jsonify({"error": "User has no associated transactions"}), 400

            transaction_ids = [t.transaction_id for t in transactions]
            disputes = Dispute.query.filter(Dispute.transaction_id.in_(transaction_ids)).all()

        disputes_list = []
        for d in disputes:
            disputes_list.append({
                'dispute_id': d.dispute_id,
                'transaction_id': d.transaction_id,
                'admin_id': d.admin_id,
                'description': d.description,
                'status': d.status,
                'resolution_date': d.resolution_date.strftime('%Y-%m-%d') if d.resolution_date else None
            })

        return jsonify(disputes_list)

    except Exception as e:
        current_app.logger.error(f"Error fetching disputes: {str(e)}")
        return jsonify({"error": "Failed to fetch disputes"}), 500


@bp.route('/api/dispute', methods=['POST'])
@login_required
def create_dispute():
    try:
        data = request.get_json()

        # Verify transaction exists and user is involved
        transaction = Transaction.query.get(data['transaction_id'])
        if not transaction:
            return jsonify({"error": "Transaction not found"}), 404

        if not (current_user.buyer and transaction.buyer_id == current_user.buyer.buyer_id) and \
                not (current_user.seller and transaction.seller_id == current_user.seller.seller_id):
            return jsonify({"error": "Unauthorized to create dispute for this transaction"}), 403

        # Create new dispute
        new_dispute = Dispute(
            dispute_id=generate_unique_id('dsp'),
            transaction_id=data['transaction_id'],
            description=data['description'],
            status='unsolved'
        )

        db.session.add(new_dispute)
        db.session.commit()

        return jsonify({
            'dispute_id': new_dispute.dispute_id,
            'transaction_id': new_dispute.transaction_id,
            'admin_id': new_dispute.admin_id,
            'description': new_dispute.description,
            'status': new_dispute.status,
            'resolution_date': None
        })

    except exc.SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Error creating dispute: {str(e)}")
        return jsonify({"error": "Failed to create dispute"}), 500


@bp.route('/api/dispute/<dispute_id>', methods=['PUT'])
@login_required
def update_dispute(dispute_id):
    try:
        # Verify user is admin
        if not current_user.admin:
            return jsonify({"error": "Unauthorized"}), 403

        dispute = Dispute.query.get(dispute_id)
        if not dispute:
            return jsonify({"error": "Dispute not found"}), 404

        data = request.get_json()

        # Update dispute fields
        if 'status' in data:
            dispute.status = data['status']
            if data['status'] == 'solved':
                dispute.resolution_date = datetime.utcnow().date()

        if not dispute.admin_id:
            dispute.admin_id = current_user.admin.admin_id

        db.session.commit()

        return jsonify({
            'dispute_id': dispute.dispute_id,
            'transaction_id': dispute.transaction_id,
            'admin_id': dispute.admin_id,
            'description': dispute.description,
            'status': dispute.status,
            'resolution_date': dispute.resolution_date.strftime('%Y-%m-%d') if dispute.resolution_date else None
        })

    except exc.SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Database error occurred"}), 500
    except Exception as e:
        current_app.logger.error(f"Error updating dispute: {str(e)}")
        return jsonify({"error": "Failed to update dispute"}), 500
