# __init__.py
from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

# Import all models AFTER db is initialized
from .PRUser import PRUser
from .transaction import Transaction  # Make sure this is imported
from .dispute import Dispute
from .admin import Admin
from .listing import Listing
from .seller import Seller
from .buyer import Buyer
from .account import Account
from .bank_account import BankAccount
from .credit_card import CreditCard
from .location import Location