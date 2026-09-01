from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.db import get_mongo_db, get_next_sequence
from app.utils.auth_decorator import token_required, generate_token

premium_bp = Blueprint("premium", __name__, url_prefix="/api/premium")

@premium_bp.route("/subscribe", methods=["POST"])
@token_required
def subscribe_premium(current_user):
    db = get_mongo_db()
    user_id = current_user["id"]
    data = request.get_json() or {}

    plan_name = data.get("plan_name", "premium_monthly")
    price = 499.00 if plan_name == "premium_monthly" else 3999.00
    days = 30 if plan_name == "premium_monthly" else 365
    expires_at = datetime.now() + timedelta(days=days)

    db.users.update_one({"id": user_id}, {"$set": {"is_premium": 1}})

    sub_id = get_next_sequence("subscriptions")
    sub_doc = {
        "id": sub_id,
        "user_id": user_id,
        "plan_name": plan_name,
        "price": price,
        "currency": "INR",
        "status": "active",
        "expires_at": expires_at.strftime("%Y-%m-%d %H:%M:%S")
    }
    db.subscriptions.insert_one(sub_doc)

    new_token = generate_token(user_id, current_user["role"], current_user["name"], is_premium=1)

    return jsonify({
        "message": f"Successfully subscribed to {plan_name.replace('_', ' ').title()} plan!",
        "token": new_token,
        "subscription": {
            "id": sub_id,
            "plan_name": plan_name,
            "price": price,
            "currency": "INR",
            "status": "active",
            "expires_at": expires_at.strftime("%Y-%m-%d")
        },
        "user": {
            "id": user_id,
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "is_premium": True
        }
    }), 200


@premium_bp.route("/status", methods=["GET"])
@token_required
def get_premium_status(current_user):
    db = get_mongo_db()
    user_id = current_user["id"]
    sub = db.subscriptions.find_one({"user_id": user_id, "status": "active"}, {"_id": 0})
    return jsonify({
        "is_premium": bool(current_user.get("is_premium", 0)),
        "subscription": sub
    }), 200
