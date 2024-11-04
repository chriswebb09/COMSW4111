from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models.PRUser import db


class Seller(db.Model):
    __tablename__ = 'seller'

    seller_id = db.Column(db.Integer, db.ForeignKey('pruser.user_id'), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'))

    # Relationships
    listings = db.relationship('Listing', backref='seller', lazy=True)
    transactions = db.relationship('Transaction', backref='seller', lazy=True)