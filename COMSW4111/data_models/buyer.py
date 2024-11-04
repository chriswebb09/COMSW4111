from COMSW4111.data_models.PRUser import db

class Buyer(db.Model):
    __tablename__ = 'buyer'

    buyer_id = db.Column(db.Integer, db.ForeignKey('pruser.user_id'), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'))

    # Relationships
    transactions = db.relationship('Transaction', backref='buyer', lazy=True)