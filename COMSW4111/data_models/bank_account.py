#!/usr/bin/env python3

from COMSW4111.data_models import db

class BankAccount(db.Model):
    __tablename__ = 'pr_bankaccount'
    account_id = db.Column(db.String(50), db.ForeignKey('pr_account.account_id'))
    bank_acc_num = db.Column(db.String(30), primary_key=True)
    routing_num = db.Column(db.String(50))