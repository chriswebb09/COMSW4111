from __future__ import annotations
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import TEXT
from sqlalchemy.types import DECIMAL
from flask_login import UserMixin

import hashlib
import hmac
import os
import posixpath
import secrets

db = SQLAlchemy()

class PRUser(UserMixin, db.Model):
    __tablename__ = 'pruser'

    user_id = db.Column(db.Integer, primary_key=True)
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
    


class Account(db.Model):
    __tablename__ = 'account'
    
    account_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('pruser.user_id'))
    account_type = db.Column(db.String(50), 
                           db.CheckConstraint("account_type IN ('bank_account', 'credit_card')"))
    billing_address = db.Column(TEXT, nullable=False)
    
    # Relationships
    bank_account = db.relationship('BankAccount', backref='account', uselist=False, lazy=True)
    credit_card = db.relationship('CreditCard', backref='account', uselist=False, lazy=True)
    seller = db.relationship('Seller', backref='account', uselist=False, lazy=True)
    buyer = db.relationship('Buyer', backref='account', uselist=False, lazy=True)

class Seller(db.Model):
    __tablename__ = 'seller'
    
    seller_id = db.Column(db.Integer, db.ForeignKey('pruser.user_id'), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'))
    
    # Relationships
    listings = db.relationship('Listing', backref='seller', lazy=True)
    transactions = db.relationship('Transaction', backref='seller', lazy=True)

class Buyer(db.Model):
    __tablename__ = 'buyer'
    
    buyer_id = db.Column(db.Integer, db.ForeignKey('pruser.user_id'), primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'))
    
    # Relationships
    transactions = db.relationship('Transaction', backref='buyer', lazy=True)

class Admin(db.Model):
    __tablename__ = 'admin'
    
    admin_id = db.Column(db.Integer, db.ForeignKey('pruser.user_id'), primary_key=True)
    admin_role = db.Column(db.String(50), nullable=False)
    
    # Relationships
    disputes = db.relationship('Dispute', backref='admin', lazy=True)

class BankAccount(db.Model):
    __tablename__ = 'bankaccount'
    
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'), primary_key=True)
    bank_acc_num = db.Column(db.String(30))
    routing_num = db.Column(db.String(50))

class CreditCard(db.Model):
    __tablename__ = 'creditcard'
    
    account_id = db.Column(db.Integer, db.ForeignKey('account.account_id'), primary_key=True)
    cc_num = db.Column(db.String(30))
    exp_date = db.Column(db.Date)

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

class Transaction(db.Model):
    __tablename__ = 'transaction'
    
    transaction_id = db.Column(db.Integer, primary_key=True)
    buyer_id = db.Column(db.Integer, db.ForeignKey('buyer.buyer_id'))
    seller_id = db.Column(db.Integer, db.ForeignKey('seller.seller_id'))
    listing_id = db.Column(db.Integer, db.ForeignKey('listing.listing_id'))
    t_date = db.Column(db.Date)
    agreed_price = db.Column(DECIMAL(10, 2), nullable=False)
    serv_fee = db.Column(DECIMAL(10, 2))
    status = db.Column(db.String(20), 
                      db.CheckConstraint("status IN ('pending', 'confirming', 'confirmed', 'completed')"),
                      nullable=False)
    
    # Relationships
    disputes = db.relationship('Dispute', backref='transaction', lazy=True)

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




SALT_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
DEFAULT_PBKDF2_ITERATIONS = 1_000_000

_os_alt_seps: list[str] = list(
    sep for sep in [os.sep, os.path.altsep] if sep is not None and sep != "/"
)


def gen_salt(length: int) -> str:
    """Generate a random string of SALT_CHARS with specified ``length``."""
    if length <= 0:
        raise ValueError("Salt length must be at least 1.")

    return "".join(secrets.choice(SALT_CHARS) for _ in range(length))


def _hash_internal(method: str, salt: str, password: str) -> tuple[str, str]:
    method, *args = method.split(":")
    salt_bytes = salt.encode()
    password_bytes = password.encode()

    if method == "scrypt":
        if not args:
            n = 2 ** 15
            r = 8
            p = 1
        else:
            try:
                n, r, p = map(int, args)
            except ValueError:
                raise ValueError("'scrypt' takes 3 arguments.") from None

        maxmem = 132 * n * r * p  # ideally 128, but some extra seems needed
        return (
            hashlib.scrypt(
                password_bytes, salt=salt_bytes, n=n, r=r, p=p, maxmem=maxmem
            ).hex(),
            f"scrypt:{n}:{r}:{p}",
        )
    elif method == "pbkdf2":
        len_args = len(args)

        if len_args == 0:
            hash_name = "sha256"
            iterations = DEFAULT_PBKDF2_ITERATIONS
        elif len_args == 1:
            hash_name = args[0]
            iterations = DEFAULT_PBKDF2_ITERATIONS
        elif len_args == 2:
            hash_name = args[0]
            iterations = int(args[1])
        else:
            raise ValueError("'pbkdf2' takes 2 arguments.")

        return (
            hashlib.pbkdf2_hmac(
                hash_name, password_bytes, salt_bytes, iterations
            ).hex(),
            f"pbkdf2:{hash_name}:{iterations}",
        )
    else:
        raise ValueError(f"Invalid hash method '{method}'.")


def generate_password_hash(
        password: str, method: str = "pbkdf2", salt_length: int = 16
) -> str:
    """Securely hash a password for storage. A password can be compared to a stored hash
    using :func:`check_password_hash`.

    The following methods are supported:

    -   ``scrypt``, the default. The parameters are ``n``, ``r``, and ``p``, the default
        is ``scrypt:32768:8:1``. See :func:`hashlib.scrypt`.
    -   ``pbkdf2``, less secure. The parameters are ``hash_method`` and ``iterations``,
        the default is ``pbkdf2:sha256:600000``. See :func:`hashlib.pbkdf2_hmac`.

    Default parameters may be updated to reflect current guidelines, and methods may be
    deprecated and removed if they are no longer considered secure. To migrate old
    hashes, you may generate a new hash when checking an old hash, or you may contact
    users with a link to reset their password.

    :param password: The plaintext password.
    :param method: The key derivation function and parameters.
    :param salt_length: The number of characters to generate for the salt.

    .. versionchanged:: 3.1
        The default iterations for pbkdf2 was increased to 1,000,000.

    .. versionchanged:: 2.3
        Scrypt support was added.

    .. versionchanged:: 2.3
        The default iterations for pbkdf2 was increased to 600,000.

    .. versionchanged:: 2.3
        All plain hashes are deprecated and will not be supported in Werkzeug 3.0.
    """
    salt = gen_salt(salt_length)
    h, actual_method = _hash_internal(method, salt, password)
    return f"{actual_method}${salt}${h}"


def check_password_hash(pwhash: str, password: str) -> bool:
    """Securely check that the given stored password hash, previously generated using
    :func:`generate_password_hash`, matches the given password.

    Methods may be deprecated and removed if they are no longer considered secure. To
    migrate old hashes, you may generate a new hash when checking an old hash, or you
    may contact users with a link to reset their password.

    :param pwhash: The hashed password.
    :param password: The plaintext password.

    .. versionchanged:: 2.3
        All plain hashes are deprecated and will not be supported in Werkzeug 3.0.
    """
    try:
        method, salt, hashval = pwhash.split("$", 2)
    except ValueError:
        return False

    return hmac.compare_digest(_hash_internal(method, salt, password)[0], hashval)


def safe_join(directory: str, *pathnames: str) -> str | None:
    """Safely join zero or more untrusted path components to a base
    directory to avoid escaping the base directory.

    :param directory: The trusted base directory.
    :param pathnames: The untrusted path components relative to the
        base directory.
    :return: A safe path, otherwise ``None``.
    """
    if not directory:
        # Ensure we end up with ./path if directory="" is given,
        # otherwise the first untrusted part could become trusted.
        directory = "."

    parts = [directory]

    for filename in pathnames:
        if filename != "":
            filename = posixpath.normpath(filename)

        if (
                any(sep in filename for sep in _os_alt_seps)
                or os.path.isabs(filename)
                # ntpath.isabs doesn't catch this on Python < 3.11
                or filename.startswith("/")
                or filename == ".."
                or filename.startswith("../")
        ):
            return None

        parts.append(filename)

    return posixpath.join(*parts)