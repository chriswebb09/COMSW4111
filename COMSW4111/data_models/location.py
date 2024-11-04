from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models.PRUser import db

class Location(db.Model):
    __tablename__ = 'location'

    location_id = db.Column(db.Integer, primary_key=True)
    longitude = db.Column(TEXT)
    latitude = db.Column(TEXT)
    zip_code = db.Column(db.String(15))
    address = db.Column(TEXT)
    building_image = db.Column(TEXT)

    # Relationships
    listings = db.relationship('Listing', backref='location', lazy=True)