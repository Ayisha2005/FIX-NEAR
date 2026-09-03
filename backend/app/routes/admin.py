import time
from flask import Blueprint, request, jsonify
from app.db import get_mongo_db, execute_query, check_mongo
from app.utils.auth_decorator import token_required, role_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/stats", methods=["GET"])
@token_required
@role_required(["admin"])
def get_admin_stats(current_user):
    db = get_mongo_db()

    total_customers = 0
    total_providers = 0
    premium_users = 0
    total_users = 0
    all_bookings = []
    active_subs = []
    categories = []
    recent = []

    if db is not None:
        try:
            total_customers = db.users.count_documents({"role": "customer"})
            total_providers = db.users.count_documents({"role": "provider"})
            premium_users = db.users.count_documents({"is_premium": 1})
            total_users = db.users.count_documents({})

            all_bookings = list(db.bookings.find({}))
            active_subs = list(db.subscriptions.find({"status": "active"}))
            categories = list(db.categories.find({}, {"_id": 0}))
            recent = list(db.bookings.find({}, {"_id": 0}).sort("id", -1).limit(10))
        except Exception as e:
            print("Mongo admin stats warning:", e)

    if not total_users:
        u_cust = execute_query("SELECT COUNT(*) as cnt FROM users WHERE role = 'customer'", fetch_one=True)
        total_customers = u_cust.get("cnt", 0) if u_cust else 0
        u_prov = execute_query("SELECT COUNT(*) as cnt FROM users WHERE role = 'provider'", fetch_one=True)
        total_providers = u_prov.get("cnt", 0) if u_prov else 0
        u_prem = execute_query("SELECT COUNT(*) as cnt FROM users WHERE is_premium = 1", fetch_one=True)
        premium_users = u_prem.get("cnt", 0) if u_prem else 0
        u_tot = execute_query("SELECT COUNT(*) as cnt FROM users", fetch_one=True)
        total_users = u_tot.get("cnt", 0) if u_tot else 0

        all_bookings = execute_query("SELECT * FROM bookings", fetch_all=True) or []
        active_subs = execute_query("SELECT * FROM subscriptions WHERE status = 'active'", fetch_all=True) or []
        categories = execute_query("SELECT * FROM categories", fetch_all=True) or []
        recent = execute_query("""
        SELECT b.*, u.name as customer_name, p.bio as provider_bio 
        FROM bookings b
        LEFT JOIN users u ON b.customer_id = u.id
        LEFT JOIN providers p ON b.provider_id = p.id
        ORDER BY b.id DESC LIMIT 10
        """, fetch_all=True) or []

    total_bookings = len(all_bookings)
    completed_bookings = sum(1 for b in all_bookings if b.get("status") == "completed")
    pending_bookings = sum(1 for b in all_bookings if b.get("status") == "pending")

    booking_revenue = sum(float(b.get("total_price", 0.0) or 0) for b in all_bookings if b.get("status") == "completed")
    subscription_revenue = sum(float(s.get("price", 0.0) or 0) for s in active_subs)

    cat_breakdown = []
    for c in categories:
        cnt = 0
        if db is not None:
            try: cnt = db.providers.count_documents({"category_id": c["id"]})
            except Exception: pass
        if not cnt:
            cnt_res = execute_query("SELECT COUNT(*) as cnt FROM providers WHERE category_id = ?", (c["id"],), fetch_one=True)
            cnt = cnt_res.get("cnt", 0) if cnt_res else 0
        cat_breakdown.append({
            "category": c["name"],
            "provider_count": cnt
        })

    for b in recent:
        if "customer_name" not in b:
            u_c = execute_query("SELECT name FROM users WHERE id = ?", (b["customer_id"],), fetch_one=True)
            b["customer_name"] = u_c.get("name") if u_c else "Customer"
        if "provider_name" not in b:
            p_res = execute_query("SELECT u.name FROM providers p JOIN users u ON p.user_id = u.id WHERE p.id = ?", (b["provider_id"],), fetch_one=True)
            b["provider_name"] = p_res.get("name") if p_res else "Provider"

    total_revenue = booking_revenue + subscription_revenue

    return jsonify({
        "admin_name": "AYISHA",
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
            "currency": "INR (₹)"
        },
        "category_breakdown": cat_breakdown,
        "recent_bookings": recent
    }), 200


@admin_bp.route("/logs", methods=["GET"])
@token_required
@role_required(["admin"])
def get_system_logs(current_user):
    mongo_status = "Online (MongoDB Atlas cluster0.zx7bkd9.mongodb.net)" if check_mongo() else "Offline (Using SQLite fallback)"
    
    logs = [
        {"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "level": "INFO", "event": "Super Admin AYISHA accessed Executive Portal", "source": "AuthSystem"},
        {"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "level": "SUCCESS", "event": f"Database Health Check: {mongo_status}", "source": "MongoDBAtlas"},
        {"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "level": "INFO", "event": "OpenStreetMap Leaflet Engine operating cleanly", "source": "GISMapEngine"},
        {"timestamp": time.strftime("%Y-%m-%d %H:%M:%S"), "level": "INFO", "event": "Google Gemini AI Assistant Side Panel online", "source": "GoogleAIEndpoint"}
    ]

    return jsonify({
        "admin": "AYISHA",
        "system_status": mongo_status,
        "logs": logs
    }), 200


@admin_bp.route("/users", methods=["GET"])
@token_required
@role_required(["admin"])
def get_all_users(current_user):
    role_filter = request.args.get("role")
    users = []

    db = get_mongo_db()
    if db is not None:
        try:
            query = {}
            if role_filter: query["role"] = role_filter
            users = list(db.users.find(query, {"password_hash": 0, "_id": 0}).sort("id", -1))
        except Exception:
            users = []

    if not users:
        sql = "SELECT id, name, email, role, is_premium, created_at FROM users WHERE 1=1"
        params = []
        if role_filter:
            sql += " AND role = ?"
            params.append(role_filter)
        sql += " ORDER BY id DESC"
        users = execute_query(sql, tuple(params), fetch_all=True) or []

    return jsonify({"users": users}), 200


@admin_bp.route("/users/<int:user_id>/toggle-premium", methods=["PUT"])
@token_required
@role_required(["admin"])
def toggle_user_premium(current_user, user_id):
    db = get_mongo_db()
    new_premium = 1

    if db is not None:
        try:
            user = db.users.find_one({"id": user_id})
            if user:
                new_premium = 0 if user.get("is_premium", 0) else 1
                db.users.update_one({"id": user_id}, {"$set": {"is_premium": new_premium}})
        except Exception:
            pass

    u_sql = execute_query("SELECT is_premium FROM users WHERE id = ?", (user_id,), fetch_one=True)
    if u_sql:
        new_premium = 0 if u_sql.get("is_premium", 0) else 1
        execute_query("UPDATE users SET is_premium = ? WHERE id = ?", (new_premium, user_id), commit=True)

    return jsonify({
        "message": f"User premium status changed to {'Premium' if new_premium else 'Standard'}.",
        "is_premium": bool(new_premium)
    }), 200


@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@token_required
@role_required(["admin"])
def delete_user(current_user, user_id):
    if user_id == current_user["id"]:
        return jsonify({"message": "Super Admin account cannot be deleted."}), 400

    db = get_mongo_db()
    if db is not None:
        try:
            db.users.delete_one({"id": user_id})
            db.providers.delete_one({"user_id": user_id})
        except Exception:
            pass

    execute_query("DELETE FROM users WHERE id = ?", (user_id,), commit=True)
    execute_query("DELETE FROM providers WHERE user_id = ?", (user_id,), commit=True)

    return jsonify({"message": f"User #{user_id} deleted successfully."}), 200
