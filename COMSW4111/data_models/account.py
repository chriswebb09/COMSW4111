#!/usr/bin/env python3

from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models import db

class Account(db.Model):
    __tablename__ = 'pr_account'
    account_id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('pruser.user_id'))
    account_type = db.Column(db.String(50), db.CheckConstraint("account_type IN ('bank_account', 'credit_card')"))
    billing_address = db.Column(TEXT, nullable=False)

    # Relationships
    bank_account = db.relationship('PR_BankAccount', backref='pr_account', uselist=False, lazy=True)
    credit_card = db.relationship('PR_CreditCard', backref='pr_account', uselist=False, lazy=True)
    seller = db.relationship('PR_Seller', backref='pr_account', uselist=False, lazy=True)
    buyer = db.relationship('PR_Buyer', backref='pr_account', uselist=False, lazy=True)

