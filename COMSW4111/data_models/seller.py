#!/usr/bin/env python3

from COMSW4111.data_models import db

class Seller(db.Model):
    __tablename__ = 'pr_seller'
    seller_id = db.Column(db.String(50), db.ForeignKey('pr_user.user_id'), primary_key=True)
    account_id = db.Column(db.String(50), db.ForeignKey('pr_account.account_id'))
    # Relationships
    listings = db.relationship('PR_Listing', backref='pr_seller', lazy=True)
    transactions = db.relationship('PR_Transaction', backref='pr_seller', lazy=True)