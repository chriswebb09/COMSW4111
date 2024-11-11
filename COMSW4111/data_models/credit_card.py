#!/usr/bin/env python3

from COMSW4111.data_models import db

class CreditCard(db.Model):
    __tablename__ = 'creditcard'
    account_id = db.Column(db.String(50), db.ForeignKey('account.account_id'))
    cc_num = db.Column(db.String(30), primary_key=True)
    exp_date = db.Column(db.Date)
