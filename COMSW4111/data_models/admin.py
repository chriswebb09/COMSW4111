#!/usr/bin/env python3

from COMSW4111.data_models import db

class Admin(db.Model):
    __tablename__ = 'pr_admin'
    admin_id = db.Column(db.String(50), db.ForeignKey('pr_user.user_id'), primary_key=True)
    admin_role = db.Column(db.String(50), nullable=False)
