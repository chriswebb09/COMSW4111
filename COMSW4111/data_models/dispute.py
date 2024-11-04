from sqlalchemy.dialects.postgresql import TEXT
from COMSW4111.data_models.PRUser import db

class Dispute(db.Model):
    __tablename__ = 'dispute'

    dispute_id = db.Column(db.Integer, primary_key=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transaction.transaction_id'))
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.admin_id'))
    description = db.Column(TEXT, nullable=False)
    status = db.Column(db.String(50),
                       db.CheckConstraint("status IN ('solved', 'unsolved')"),
                       nullable=False)
    resolution_date = db.Column(db.Date)