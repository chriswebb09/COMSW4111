from COMSW4111.data_models import db
from COMSW4111.data_models.dispute import Dispute

class Admin(db.Model):
    __tablename__ = 'admin'

    admin_id = db.Column(db.String(50), db.ForeignKey('pruser.user_id'), primary_key=True)
    admin_role = db.Column(db.String(50), nullable=False)
