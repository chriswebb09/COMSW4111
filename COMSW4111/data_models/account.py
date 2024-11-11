#!/usr/bin/env python3

from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models import db

class Account(db.Model):
    __tablename__ = 'account'

    account_id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('pruser.user_id'))
    account_type = db.Column(db.String(50), db.CheckConstraint("account_type IN ('bank_account', 'credit_card')"))
    billing_address = db.Column(TEXT, nullable=False)

    # Relationships
    bank_account = db.relationship('BankAccount', backref='account', uselist=False, lazy=True)
    credit_card = db.relationship('CreditCard', backref='account', uselist=False, lazy=True)
    seller = db.relationship('Seller', backref='account', uselist=False, lazy=True)
    buyer = db.relationship('Buyer', backref='account', uselist=False, lazy=True)

