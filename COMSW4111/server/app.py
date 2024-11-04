# Custom decorator for checking account status
from functools import wraps
from flask import jsonify
from flask_login import LoginManager, current_user

def check_account_status(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.acc_status == 'banned':
            return jsonify({'error': 'Account is banned'}), 403
        if current_user.acc_status == 'inactive':
            return jsonify({'error': 'Account is inactive'}), 403
        return f(*args, **kwargs)

    return decorated_function
