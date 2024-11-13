#!/usr/bin/env python3

from flask import jsonify, request, current_app, session, render_template
from flask_login import login_required, current_user, login_user
from datetime import datetime
import uuid
from COMSW4111.data_models import db
from COMSW4111.data_models import PRUser
from COMSW4111.data_models import Admin
from COMSW4111.server.admin import bp
from COMSW4111.data_models import Dispute
from COMSW4111.data_models import Transaction
from COMSW4111.data_models import Buyer
from COMSW4111.data_models import Seller
from sqlalchemy.exc import SQLAlchemyError


@bp.route('/api/admin/disputes', methods=['GET'])
@login_required
def get_admin_disputes():
    """Get all disputed transactions for admin"""
    try:
        # Verify admin access
        if not current_user.admin:
            return jsonify({'error': 'Unauthorized access'}), 403

        # Query disputes with related transaction data
        disputes = db.session.query(
            Dispute,
            Transaction,
            PRUser.first_name.label('buyer_first_name'),
            PRUser.last_name.label('buyer_last_name')
        ).join(
            Transaction, Dispute.transaction_id == Transaction.transaction_id
        ).join(
            Buyer, Transaction.buyer_id == Buyer.buyer_id
        ).join(
            PRUser, Buyer.buyer_id == PRUser.user_id
        ).all()

        disputes_data = [{
            'dispute_id': dispute.Dispute.dispute_id,
            'transaction_id': dispute.Dispute.transaction_id,
            'status': dispute.Dispute.status,
            'description': dispute.Dispute.description,
            'amount': float(dispute.Transaction.agreed_price),
            'transaction_date': dispute.Transaction.t_date.strftime('%Y-%m-%d'),
            'resolution_date': dispute.Dispute.resolution_date.strftime('%Y-%m-%d') if dispute.Dispute.resolution_date else None,
            'filed_by': f"{dispute.buyer_first_name} {dispute.buyer_last_name}",
            'transaction_status': dispute.Transaction.status
        } for dispute in disputes]

        return jsonify({'disputes': disputes_data}), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching disputes: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/api/admin/disputes/<string:dispute_id>/status', methods=['PUT'])
@login_required
def update_dispute_status(dispute_id):
    """Update dispute status"""
    try:
        # Verify admin access
        if not current_user.admin:
            return jsonify({'error': 'Unauthorized access'}), 403

        data = request.get_json()
        new_status = data.get('status')

        if new_status not in ['solved', 'unsolved']:
            return jsonify({'error': 'Invalid status'}), 400

        dispute = Dispute.query.get(dispute_id)
        if not dispute:
            return jsonify({'error': 'Dispute not found'}), 404

        dispute.status = new_status
        if new_status == 'solved':
            dispute.resolution_date = datetime.utcnow().date()
            dispute.admin_id = current_user.admin.admin_id

        db.session.commit()

        return jsonify({
            'message': 'Dispute status updated successfully',
            'dispute_id': dispute_id,
            'status': new_status,
            'resolution_date': dispute.resolution_date.strftime('%Y-%m-%d') if dispute.resolution_date else None
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating dispute status: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/admin', methods=['GET'])
def get_admin():
    return render_template("admin.html")

@bp.route('/admin/login', methods=['GET'])
def get_admin_login():
    return render_template("admin_login.html")

@bp.route('/admin/signup', methods=['GET'])
def get_admin_signup():
    return render_template("admin_login.html")

@bp.route('/api/admin/signup', methods=['POST'])
def create_admin_account():
    """Create a new admin user account"""
    form_data = request.get_json()
    try:
        user_id = str(uuid.uuid4())
        # Create new user
        new_user = PRUser(
            user_id=user_id,
            first_name=form_data['first_name'],
            last_name=form_data['last_name'],
            email=form_data['email'],
            address=form_data['address'],
            phone_number=form_data['phone_number'],
            acc_status='active',
            t_created=datetime.utcnow(),
            t_last_act=datetime.utcnow()
        )
        new_user.set_password(form_data['password'])
        # Create admin role
        new_admin = Admin(
            admin_id=user_id,
            admin_role="super"
        )

        # Save to database
        db.session.add(new_user)
        db.session.add(new_admin)
        db.session.commit()
        return jsonify({
            'message': 'Admin account created successfully',
            'user_id': user_id,
            'admin_role': "super"
        }), 201

    except SQLAlchemyError as e:
        db.session.rollback()
        current_app.logger.error(f"Database error creating admin account: {str(e)}")
        return jsonify({'error': 'Database error'}), 500
    except Exception as e:
        current_app.logger.error(f"Error creating admin account: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
