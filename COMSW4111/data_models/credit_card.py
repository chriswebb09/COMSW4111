#!/usr/bin/env python3

from COMSW4111.data_models import db

class CreditCard(db.Model):
    __tablename__ = 'creditcard'

    account_id = db.Column(db.String(50), db.ForeignKey('account.account_id'), primary_key=True)
    cc_num = db.Column(db.String(30))
    exp_date = db.Column(db.Date)
