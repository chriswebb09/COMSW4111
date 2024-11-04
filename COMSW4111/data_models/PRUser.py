from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import TEXT
from sqlalchemy.types import DECIMAL
from flask_login import UserMixin
from COMSW4111.data_models.password_logic import generate_password_hash
from COMSW4111.data_models.password_logic import check_password_hash

db = SQLAlchemy()

class PRUser(UserMixin, db.Model):
    __tablename__ = 'pruser'
    user_id = db.Column(db.String(50), primary_key=True)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))  # Changed from password
    address = db.Column(TEXT, nullable=False)
    phone_number = db.Column(db.Integer)
    t_created = db.Column(db.DateTime, default=datetime.utcnow)
    t_last_act = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    acc_status = db.Column(db.String(20),
                           db.CheckConstraint("acc_status IN ('active', 'inactive', 'banned')"))
    # Relationships
    accounts = db.relationship('Account', backref='user', lazy=True)
    seller = db.relationship('Seller', backref='user', uselist=False, lazy=True)
    buyer = db.relationship('Buyer', backref='user', uselist=False, lazy=True)
    admin = db.relationship('Admin', backref='user', uselist=False, lazy=True)

    def get_id(self):
        return str(self.user_id)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)



class Admin(db.Model):
    __tablename__ = 'admin'
    
    admin_id = db.Column(db.Integer, db.ForeignKey('pruser.user_id'), primary_key=True)
    admin_role = db.Column(db.String(50), nullable=False)
    
    # Relationships
    disputes = db.relationship('Dispute', backref='admin', lazy=True)

class CreditCard(db.Model):
    __tablename__ = 'creditcard'
    
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'), primary_key=True)
    cc_num = db.Column(db.String(30))
    exp_date = db.Column(db.Date)






