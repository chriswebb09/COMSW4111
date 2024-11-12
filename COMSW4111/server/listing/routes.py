#!/usr/bin/env python3

from COMSW4111.server.listing import bp
from flask_login import login_required, current_user
from pprint import pformat
from flask import render_template, session, request, redirect, json, jsonify
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import uuid
from COMSW4111.data_models import db
from COMSW4111.data_models import Account
from COMSW4111.data_models import Seller
from COMSW4111.data_models import PRUser
from COMSW4111.data_models import Listing
from sqlalchemy import exc

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = 'static/listing_images'

@bp.route('/listing/<string:listing_id>', methods=['GET'])
def listing_page(listing_id):
    listing = Listing.query.filter_by(listing_id=listing_id).first()
    print(listing)
    seller_user = PRUser.query.filter_by(user_id=listing.seller_id).first()
    print(seller_user)
    # seller = Seller.query.filter_by(seller_id=listing.seller_id).first()
    list_data = {
                "listing_id": str(listing.__dict__['listing_id']),
                "seller_id": str(listing.__dict__['seller_id']),
                "status": str(listing.__dict__["status"]),
                "title": str(listing.__dict__["title"]),
                "description": str(listing.__dict__["description"]),
                "price": float(listing.__dict__["price"]),
                "list_image": str(listing.__dict__["list_image"]),
                "meta_tag": listing.__dict__["meta_tag"],
                "t_created" : listing.__dict__["t_created"],
                "seller_name": seller_user.__dict__["first_name"] + " " + seller_user.__dict__["last_name"],
                "seller_email": seller_user.__dict__["email"],
                "t_last_edit" : listing.__dict__["t_last_edit"],
                "location_id": str(listing.__dict__["location_id"])
    }
    return render_template('listing.html', title='Listing', listing_data=list_data)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_seller_exists():
    """Ensure current user has a seller account, create if doesn't exist"""
    seller = Seller.query.get(current_user.user_id)
    if not seller:
        # Get user's default account
        account = Account.query.filter_by(user_id=current_user.user_id).first()
        if not account:
            raise ValueError("No account found for user")

        seller = Seller(
            seller_id=current_user.user_id,
            account_id=account.account_id
        )
        db.session.add(seller)
        db.session.commit()
    return seller


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.route('/api/listings/upload-images', methods=['POST'])
def upload_images():
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400

    file = request.files['images']

    if not file:
        return jsonify({'error': 'No selected file'}), 400

    try:
        if file and allowed_file(file.filename):
            # Create unique filename
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"

            # Ensure upload directory exists
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

            # Save file
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            file.save(file_path)

            # Generate URL
            image_url = f"/static/listing_images/{unique_filename}"

            return jsonify({
                'message': 'Image uploaded successfully',
                'imageUrl': image_url
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400

    except Exception as e:
        current_app.logger.error(f"Error uploading image: {str(e)}")
        return jsonify({'error': 'Failed to upload image'}), 500


@bp.route('/api/listings/create', methods=['POST'])
@login_required
def create_listing():
    try:
        # Ensure user is a seller
        seller = ensure_seller_exists()

        # Handle form data
        data = request.form

        # Validate required fields
        required_fields = ['title', 'price', 'description']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Handle image upload if present
        image_url = None
        if 'images' in request.files:
            file = request.files['images']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4()}_{filename}"

                # Ensure upload directory exists
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)

                # Save file
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(file_path)
                image_url = f"/static/listing_images/{unique_filename}"

        # Create new listing
        current_time = datetime.utcnow()
        new_listing = Listing(
            listing_id=str(uuid.uuid4()),
            seller_id=seller.seller_id,
            status="active",
            title=data['title'],
            description=data['description'],
            price=float(data['price']),
            list_image=image_url,
            location_id=data.get('location_id'),
            meta_tag=data.get('meta_tags', ''),
            t_created=current_time,
            t_last_edit=current_time
        )

        db.session.add(new_listing)
        db.session.commit()

        return jsonify({
            'message': 'Listing created successfully',
            'listing_id': new_listing.listing_id
        }), 201

    except ValueError as ve:
        db.session.rollback()
        current_app.logger.error(f"Validation error: {str(ve)}")
        return jsonify({'error': str(ve)}), 400

    except exc.IntegrityError as e:
        db.session.rollback()
        current_app.logger.error(f"Database integrity error: {str(e)}")
        return jsonify({'error': 'Database integrity error'}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error creating listing: {str(e)}")
        return jsonify({'error': 'Failed to create listing'}), 500


@bp.route('/api/listings/<string:listing_id>', methods=['GET'])
def get_listing(listing_id):
    try:
        listing = Listing.query.get(listing_id)

        if not listing:
            return jsonify({'error': 'Listing not found'}), 404

        return jsonify({
            'listing_id': listing.listing_id,
            'seller_id': listing.seller_id,
            'status': listing.status,
            'title': listing.title,
            'description': listing.description,
            'price': float(listing.price),
            'list_image': listing.list_image,
            'location_id': listing.location_id,
            'meta_tag': listing.meta_tag,
            't_created': listing.t_created.isoformat(),
            't_last_edit': listing.t_last_edit.isoformat()
        }), 200

    except Exception as e:
        current_app.logger.error(f"Error fetching listing: {str(e)}")
        return jsonify({'error': 'Failed to fetch listing'}), 500


@bp.route('/api/listings/<string:listing_id>', methods=['PUT'])
def update_listing(listing_id):
    try:
        listing = Listing.query.get(listing_id)

        if not listing:
            return jsonify({'error': 'Listing not found'}), 404

        data = request.get_json()

        # Update fields if provided
        if 'title' in data:
            listing.title = data['title']
        if 'description' in data:
            listing.description = data['description']
        if 'status' in data:
            listing.status = data['status']
        if 'price' in data:
            listing.price = data['price']
        if 'list_image' in data:
            listing.list_image = data['list_image']
        if 'location_id' in data:
            listing.location_id = data['location_id']
        if 'meta_tag' in data:
            listing.meta_tag = data['meta_tag']

        # Update last edit timestamp
        listing.t_last_edit = datetime.utcnow()

        db.session.commit()

        return jsonify({
            'message': 'Listing updated successfully',
            'listing_id': listing_id
        }), 200

    except exc.IntegrityError as e:
        db.session.rollback()
        current_app.logger.error(f"Database integrity error: {str(e)}")
        return jsonify({'error': 'Database integrity error'}), 400

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating listing: {str(e)}")
        return jsonify({'error': 'Failed to update listing'}), 500


@bp.route('/api/listings/<string:listing_id>', methods=['DELETE'])
def delete_listing(listing_id):
    try:
        listing = Listing.query.get(listing_id)

        if not listing:
            return jsonify({'error': 'Listing not found'}), 404

        db.session.delete(listing)
        db.session.commit()

        return jsonify({
            'message': 'Listing deleted successfully'
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting listing: {str(e)}")
        return jsonify({'error': 'Failed to delete listing'}), 500


@bp.route('/api/listing/search', methods=['GET'])
def search_listings():
    if request.args is None:
        listings = Listing.query.all()
        # Format results
        results = [{
            'listing_id': listing.listing_id,
            'seller_id': listing.seller_id,
            'title': listing.title,
            'status': listing.status,
            'description': listing.description,
            'price': float(listing.price),
            'list_image': listing.list_image,
            'location_id': listing.location_id,
            'meta_tag': listing.meta_tag,
            't_created': listing.t_created.isoformat(),
            't_last_edit': listing.t_last_edit.isoformat()
        } for listing in listings]

        return jsonify(results), 200
    else:
        try:
            # Get search parameters
            title = request.args.get('title', '')
            min_price = request.args.get('min_price', type=float)
            max_price = request.args.get('max_price', type=float)
            meta_tag = request.args.get('meta_tag', '')

            # Build query
            query = Listing.query

            if title:
                query = query.filter(Listing.title.ilike(f'%{title}%'))
            if min_price is not None:
                query = query.filter(Listing.price >= min_price)
            if max_price is not None:
                query = query.filter(Listing.price <= max_price)
            if meta_tag:
                query = query.filter(Listing.meta_tag.ilike(f'%{meta_tag}%'))

            # Execute query
            listings = query.all()

            # Format results
            results = [{
                'listing_id': listing.listing_id,
                'seller_id': listing.seller_id,
                'title': listing.title,
                'status': listing.status,
                'description': listing.description,
                'price': float(listing.price),
                'list_image': listing.list_image,
                'location_id': listing.location_id,
                'meta_tag': listing.meta_tag,
                't_created': listing.t_created.isoformat(),
                't_last_edit': listing.t_last_edit.isoformat()
            } for listing in listings]

            return jsonify(results), 200

        except Exception as e:
            current_app.logger.error(f"Error searching listings: {str(e)}")
            return jsonify({'error': 'Failed to search listings'}), 500




