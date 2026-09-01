from flask import Blueprint, request, jsonify
from app.db import get_mongo_db
from app.utils.auth_decorator import token_required, role_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/stats", methods=["GET"])
@token_required
@role_required(["admin"])
def get_admin_stats(current_user):
    db = get_mongo_db()

    total_customers = db.users.count_documents({"role": "customer"})
    total_providers = db.users.count_documents({"role": "provider"})
    premium_users = db.users.count_documents({"is_premium": 1})
    total_users = db.users.count_documents({})

    all_bookings = list(db.bookings.find({}))
    total_bookings = len(all_bookings)
    completed_bookings = sum(1 for b in all_bookings if b.get("status") == "completed")
    pending_bookings = sum(1 for b in all_bookings if b.get("status") == "pending")

    booking_revenue = sum(b.get("total_price", 0.0) for b in all_bookings if b.get("status") == "completed")

    active_subs = list(db.subscriptions.find({"status": "active"}))
    subscription_revenue = sum(s.get("price", 0.0) for s in active_subs)

    categories = list(db.categories.find({}, {"_id": 0}))
    cat_breakdown = []
    for c in categories:
        cnt = db.providers.count_documents({"category_id": c["id"]})
        cat_breakdown.append({
            "category": c["name"],
            "provider_count": cnt
        })

    recent = list(db.bookings.find({}, {"_id": 0}).sort("id", -1).limit(6))
    for b in recent:
        u_c = db.users.find_one({"id": b["customer_id"]})
        prov = db.providers.find_one({"id": b["provider_id"]})
        u_p = db.users.find_one({"id": prov["user_id"]}) if prov else None
        c = db.categories.find_one({"id": prov["category_id"]}) if prov else None

        b["customer_name"] = u_c["name"] if u_c else "Customer"
        b["provider_name"] = u_p["name"] if u_p else "Provider"
        b["category_name"] = c["name"] if c else "General"

    total_revenue = booking_revenue + subscription_revenue

    return jsonify({
        "kpis": {
            "total_users": total_users,
            "total_customers": total_customers,
            "total_providers": total_providers,
            "premium_users": premium_users,
            "total_bookings": total_bookings,
            "completed_bookings": completed_bookings,
            "pending_bookings": pending_bookings,
            "total_revenue": round(total_revenue, 2),
            "booking_revenue": round(booking_revenue, 2),
            "subscription_revenue": round(subscription_revenue, 2),
            "currency": "INR"
        },
        "category_breakdown": cat_breakdown,
        "recent_bookings": recent
    }), 200


@admin_bp.route("/users", methods=["GET"])
@token_required
@role_required(["admin"])
def get_all_users(current_user):
    db = get_mongo_db()
    role_filter = request.args.get("role")

    query = {}
    if role_filter:
        query["role"] = role_filter

    users = list(db.users.find(query, {"password_hash": 0, "_id": 0}).sort("id", -1))
    return jsonify({"users": users}), 200


@admin_bp.route("/users/<int:user_id>/toggle-premium", methods=["PUT"])
@token_required
@role_required(["admin"])
def toggle_user_premium(current_user, user_id):
    db = get_mongo_db()
    user = db.users.find_one({"id": user_id})
    if not user:
        return jsonify({"message": "User not found."}), 404

    new_premium = 0 if user.get("is_premium", 0) else 1
    db.users.update_one({"id": user_id}, {"$set": {"is_premium": new_premium}})

    return jsonify({
        "message": f"User premium status changed to {'Premium' if new_premium else 'Standard'}.",
        "is_premium": bool(new_premium)
    }), 200
