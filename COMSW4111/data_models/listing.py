#!/usr/bin/env python3

from sqlalchemy.dialects.postgresql import TEXT
from sqlalchemy.types import DECIMAL
from COMSW4111.data_models import db

class Listing(db.Model):
    __tablename__ = 'pr_listing'

    listing_id = db.Column(db.String(50), primary_key=True)
    seller_id = db.Column(db.String(50), db.ForeignKey('pr_seller.seller_id'))
    status = db.Column(db.String(50), db.CheckConstraint("status IN ('active', 'pending', 'closed', 'completed')"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(TEXT)
    price = db.Column(DECIMAL(10, 2), nullable=False)
    list_image = db.Column(TEXT)
    location_id = db.Column(db.String(50), db.ForeignKey('pr_location.location_id'))
    meta_tag = db.Column(TEXT)
    t_created = db.Column(db.DateTime)
    t_last_edit = db.Column(db.DateTime)

    # Relationships
    transactions = db.relationship('Transaction', backref='pr_listing', lazy=True)




