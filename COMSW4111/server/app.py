# Custom decorator for checking account status
from functools import wraps
from flask import jsonify
from flask_login import LoginManager, current_user

def handle_exceptions(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database error: {str(e)}")
            return jsonify({'error': 'Database error'}), 500
        except Exception as e:
            current_app.logger.error(f"Error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    return decorated_function

def check_account_status(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.acc_status == 'banned':
            return jsonify({'error': 'Account is banned'}), 403
        if current_user.acc_status == 'inactive':
            return jsonify({'error': 'Account is inactive'}), 403
        return f(*args, **kwargs)

    return decorated_function
