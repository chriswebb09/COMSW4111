from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models.password_logic import generate_password_hash, check_password_hash
from flask_login import UserMixin
from . import db

class PRUser(UserMixin, db.Model):
    __tablename__ = 'pruser'
    user_id = db.Column(db.String(50), primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))  # Changed from password
    address = db.Column(TEXT, nullable=False)
    phone_number = db.Column(db.String(30))
    t_created = db.Column(db.DateTime, default=datetime.utcnow)
    t_last_act = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    acc_status = db.Column(db.String(20), db.CheckConstraint("acc_status IN ('active', 'inactive', 'banned')"))
    # Relationships
    accounts = db.relationship('Account', backref='pruser', lazy=True)
    seller = db.relationship('Seller', backref='pruser', uselist=False, lazy=True)
    buyer = db.relationship('Buyer', backref='pruser', uselist=False, lazy=True)
    admin = db.relationship('Admin', backref='pruser', uselist=False, lazy=True)

    def get_id(self):
        return self.user_id

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        self.password_hash = self.password_hash.strip()
        return check_password_hash(self.password_hash, password)

