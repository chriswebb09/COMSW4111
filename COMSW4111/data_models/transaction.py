#!/usr/bin/env python3

from COMSW4111.data_models import db
from sqlalchemy.types import DECIMAL

class Transaction(db.Model):
    __tablename__ = 'pr_transaction'
    transaction_id = db.Column(db.String(50), primary_key=True)
    buyer_id = db.Column(db.String(50), db.ForeignKey('pr_buyer.buyer_id'))
    seller_id = db.Column(db.String(50), db.ForeignKey('pr_seller.seller_id'))
    listing_id = db.Column(db.String(50), db.ForeignKey('pr_listing.listing_id'))
    t_date = db.Column(db.Date)
    agreed_price = db.Column(DECIMAL(10, 2), nullable=False)
    serv_fee = db.Column(DECIMAL(10, 2))
    status = db.Column(db.String(20), db.CheckConstraint("status IN ('pending', 'confirming', 'confirmed', 'completed')"), nullable=False)