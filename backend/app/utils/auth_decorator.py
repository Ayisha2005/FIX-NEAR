import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify
from app.config import Config
from app.db import get_mongo_db, execute_query

def generate_token(user_id, role, name, is_premium=0):
    payload = {
        "user_id": user_id,
        "role": role,
        "name": name,
        "is_premium": is_premium,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")
    return token

def decode_token(token):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"message": "Token is missing!"}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({"message": "Token is invalid or expired!"}), 401

        user_id = payload.get("user_id")

        # Try MongoDB Atlas first, then SQLite fallback
        try:
            db = get_mongo_db()
            user = db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
        except Exception:
            user = None

        if not user:
            user = execute_query(
                "SELECT id, name, email, role, is_premium FROM users WHERE id = ?",
                (user_id,),
                fetch_one=True
            )

        if not user:
            return jsonify({"message": "User not found!"}), 401

        kwargs["current_user"] = user
        return f(*args, **kwargs)

    return decorated

def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            current_user = kwargs.get("current_user")
            if not current_user or current_user.get("role") not in allowed_roles:
                return jsonify({"message": "Access denied. Unauthorized role."}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
