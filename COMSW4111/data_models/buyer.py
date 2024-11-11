#!/usr/bin/env python3

from COMSW4111.data_models import db

class Buyer(db.Model):
    __tablename__ = 'pr_buyer'

    buyer_id = db.Column(db.String(50), db.ForeignKey('pr_user.user_id'), primary_key=True)
    account_id = db.Column(db.String(50), db.ForeignKey('pr_account.account_id'))

    # Relationships
    transactions = db.relationship('PR_Transaction', backref='pr_buyer', lazy=True)