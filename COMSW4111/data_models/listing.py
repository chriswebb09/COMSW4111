from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models.PRUser import db

class Listing(db.Model):
    __tablename__ = 'listing'

    listing_id = db.Column(db.Integer, primary_key=True)
    seller_id = db.Column(db.Integer, db.ForeignKey('seller.seller_id'))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(TEXT)
    price = db.Column(DECIMAL(10, 2), nullable=False)
    list_image = db.Column(TEXT)
    location_id = db.Column(db.Integer, db.ForeignKey('location.location_id'))
    meta_tag = db.Column(TEXT)
    t_created = db.Column(db.DateTime)
    t_last_edit = db.Column(db.DateTime)

    # Relationships
    transactions = db.relationship('Transaction', backref='listing', lazy=True)



