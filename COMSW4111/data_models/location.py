#!/usr/bin/env python3

from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models import db

class Location(db.Model):
    __tablename__ = 'pr_location'
    location_id = db.Column(db.String(50), primary_key=True)
    longitude = db.Column(TEXT)
    latitude = db.Column(TEXT)
    zip_code = db.Column(db.String(15))
    address = db.Column(TEXT)
    building_image = db.Column(TEXT)
    # Relationships
    listings = db.relationship('Listing', backref='pr_location', lazy=True)