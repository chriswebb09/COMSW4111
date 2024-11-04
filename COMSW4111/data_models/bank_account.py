from COMSW4111.data_models.PRUser import db

class BankAccount(db.Model):
    __tablename__ = 'bankaccount'

    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'), primary_key=True)
    bank_acc_num = db.Column(db.String(30))
    routing_num = db.Column(db.String(50))