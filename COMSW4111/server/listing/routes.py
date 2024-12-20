#!/usr/bin/env python3

import os
import uuid
from sqlalchemy import exc
from datetime import datetime
from COMSW4111.server.listing import bp
from werkzeug.utils import secure_filename
from flask_login import login_required, current_user
from flask import render_template, request, jsonify, current_app, send_from_directory, abort
from COMSW4111.data_models import db, Account, Seller, PRUser, Listing

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
UPLOAD_FOLDER = 'static/listing_images'

def allowed_file(filename):
    """Check if the file has a valid extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file):
    """Handle file saving and return the URL or an error message."""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{filename}"
        file_dir = os.path.join(current_app.root_path, UPLOAD_FOLDER)
        os.makedirs(file_dir, exist_ok=True)
        file_path = os.path.join(file_dir, unique_filename)
        file.save(file_path)
        return f"/{UPLOAD_FOLDER}/{unique_filename}"
    return None


@bp.route('/listing/<string:listing_id>', methods=['GET'])
@login_required
def listing_page(listing_id):
    result = (
        db.session.query(Listing, PRUser)
        .join(PRUser, Listing.seller_id == PRUser.user_id)
        .filter(Listing.listing_id == listing_id)
        .first()
    )
    if not result:
        return None
    listing, seller = result
    list_data = {
        "listing_id": str(listing.listing_id),
        "seller_id": str(listing.seller_id),
        "status": str(listing.status),
        "title": str(listing.title),
        "description": str(listing.description),
        "price": float(listing.price),
        "list_image": str(listing.list_image),
        "meta_tag": listing.meta_tag,
        "t_created": listing.t_created,
        "seller_name": f"{seller.first_name} {seller.last_name}",
        "seller_email": seller.email,
        "t_last_edit": listing.t_last_edit,
        "location_id": str(listing.location_id),
        'your_listing': listing.seller_id == current_user.user_id
    }
    return render_template('listing.html', title='Listing', listing_data=list_data)

def ensure_seller_exists():
    seller = Seller.query.get(current_user.user_id)
    if not seller:
        account = Account.query.filter_by(user_id=current_user.user_id).first()
        if not account:
            account = Account(
                account_id=str(uuid.uuid4()),
                user_id=current_user.user_id,
                billing_address=current_user.address
            )
            db.session.add(account)
            db.session.commit()
        seller = Seller(seller_id=current_user.user_id, account_id=account.account_id)
        db.session.add(seller)
        db.session.commit()
    return seller


@bp.route('/api/listings/upload-images', methods=['POST'])
@login_required
def upload_images():
    if 'images' not in request.files:
        return jsonify({'error': 'No images provided'}), 400
    file = request.files['images']
    if not file:
        return jsonify({'error': 'No selected file'}), 400
    try:
        image_url = save_file(file)
        if image_url:
            return jsonify({
                'message': 'Image uploaded successfully',
                'imageUrl': image_url
            }), 200
        else:
            return jsonify({'error': 'Invalid file type'}), 400
    except Exception as e:
        current_app.logger.error(f"Error uploading image: {str(e)}")
        return jsonify({'error': 'Failed to upload image'}), 500


@bp.route('/api/get-images/<string:image_name>', methods=['GET'])
def get_images(image_name):
    try:
        upload_path = "/Users/christopherwebb/Developer/COMSW4111/static/listing_images"
        # Check if file exists
        full_path = os.path.join(upload_path, image_name)
        if not os.path.exists(full_path):
            print(f"File not found: {full_path}")
            return abort(404)
        # Add mime type for better browser handling
        return send_from_directory(
            upload_path,
            image_name,
            mimetype='image/jpeg'
        )
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return abort(500)

@bp.route('/api/listings/create', methods=['POST'])
@login_required
def create_listing():
    data = request.form
    try:
        seller = ensure_seller_exists()
        image_url = None
        if 'images' in request.files:
            file = request.files['images']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                unique_filename = f"{filename}"
                os.makedirs(UPLOAD_FOLDER, exist_ok=True)
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                file.save(file_path)
                image_url = f"/static/listing_images/{unique_filename}"
                print(image_url)
        current_time = datetime.utcnow()
        new_listing = Listing(
            listing_id=str(uuid.uuid4()),
            seller_id=seller.seller_id,
            status="active",
            title=data['title'],
            description=data['description'],
            price=float(data['price']),
            list_image=unique_filename,
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
@login_required
def get_listing(listing_id):
    try:
        listing = Listing.query.get(listing_id)
        print(listing.seller_id == current_user.user_id)
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
            't_created': listing.t_created.utcnow().isoformat(),
            't_last_edit': listing.t_last_edit.utcnow().isoformat(),
            'your_listing': listing.seller_id == current_user.user_id
        }), 200
    except Exception as e:
        current_app.logger.error(f"Error fetching listing: {str(e)}")
        return jsonify({'error': 'Failed to fetch listing'}), 500

@bp.route('/api/listings/<string:listing_id>', methods=['PUT'])
@login_required
def update_listing(listing_id):
    try:
        listing = Listing.query.get(listing_id)
        if not listing:
            return jsonify({'error': 'Listing not found'}), 404
        data = request.get_json()
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
@login_required
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
@login_required
def search_listings():
    try:
        title = request.args.get('title', '')
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        meta_tag = request.args.get('meta_tag', '')
        query = Listing.query
        if title:
            query = query.filter(Listing.title.ilike(f'%{title}%'))
        if min_price is not None:
            query = query.filter(Listing.price >= min_price)
        if max_price is not None:
            query = query.filter(Listing.price <= max_price)
        if meta_tag:
            query = query.filter(Listing.meta_tag.ilike(f'%{meta_tag}%'))
        listings = query.all()
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

@bp.route('/api/listings/status', methods=['PATCH'])
@login_required
def update_listing_status():
    data = request.get_json()
    listing_id = data['listing_id']
    try:
        listing = Listing.query.filter_by(listing_id=listing_id).first()
        # if listing.seller_id != current_user.user_id:
        #     print('Unauthorized to update this listing')
        #     return jsonify({'error': 'Unauthorized to update this listing'}), 403
        new_status = data['status']
        listing.status = new_status
        listing.t_last_edit = datetime.utcnow()
        db.session.commit()
        return jsonify({
            'message': 'Listing status updated successfully',
            'listing_id': listing_id,
            'status': new_status,
            't_last_edit': listing.t_last_edit.isoformat()
        }), 200
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error updating listing status: {str(e)}")
        return jsonify({'error': 'Failed to update listing status'}), 500