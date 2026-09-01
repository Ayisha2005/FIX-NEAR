from flask import Blueprint, request, jsonify
from app.db import get_mongo_db, execute_query
from app.utils.security import mask_phone, mask_email
from app.utils.auth_decorator import token_required, decode_token, role_required

providers_bp = Blueprint("providers", __name__, url_prefix="/api/providers")

def should_unmask_contact(current_user_id, is_premium, provider_id, provider_user_id, role):
    if not current_user_id:
        return False
    if role == "admin" or current_user_id == provider_user_id:
        return True
    if is_premium:
        return True
    db = get_mongo_db()
    if db is not None:
        try:
            unlocked = db.contact_unlocks.find_one({"customer_id": current_user_id, "provider_id": provider_id})
            if unlocked: return True
        except Exception:
            pass
    
    unlocked_sql = execute_query("SELECT id FROM contact_unlocks WHERE customer_id = ? AND provider_id = ?", (current_user_id, provider_id), fetch_one=True)
    return bool(unlocked_sql)

@providers_bp.route("", methods=["GET"])
def search_providers():
    db = get_mongo_db()
    category_id = request.args.get("category_id")
    query = request.args.get("q", "").strip()
    min_rating = request.args.get("min_rating", type=float)
    max_rate = request.args.get("max_rate", type=float)

    auth_header = request.headers.get("Authorization")
    user_id = None
    is_premium = False
    role = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload:
            user_id = payload.get("user_id")
            role = payload.get("role")
            if db is not None:
                try:
                    u = db.users.find_one({"id": user_id})
                    if u: is_premium = bool(u.get("is_premium", 0))
                except Exception:
                    pass
            if not is_premium:
                u_sql = execute_query("SELECT is_premium FROM users WHERE id = ?", (user_id,), fetch_one=True)
                if u_sql: is_premium = bool(u_sql.get("is_premium", 0))

    providers_raw = []
    if db is not None:
        try:
            query_filter = {}
            if category_id and category_id.isdigit():
                query_filter["category_id"] = int(category_id)
            if min_rating is not None:
                query_filter["rating"] = {"$gte": min_rating}
            if max_rate is not None:
                query_filter["hourly_rate"] = {"$lte": max_rate}

            providers_raw = list(db.providers.find(query_filter, {"_id": 0}))
        except Exception:
            providers_raw = []

    if not providers_raw:
        sql = """
        SELECT p.*, u.name as provider_name, c.name as category_name, c.icon as category_icon 
        FROM providers p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
        """
        params = []
        if category_id and category_id.isdigit():
            sql += " AND p.category_id = ?"
            params.append(int(category_id))
        if min_rating is not None:
            sql += " AND p.rating >= ?"
            params.append(min_rating)
        if max_rate is not None:
            sql += " AND p.hourly_rate <= ?"
            params.append(max_rate)

        providers_raw = execute_query(sql, tuple(params), fetch_all=True) or []

    processed = []
    for p in providers_raw:
        provider_name = p.get("provider_name")
        category_name = p.get("category_name")
        category_icon = p.get("category_icon", "Wrench")

        if not provider_name:
            u_res = execute_query("SELECT name FROM users WHERE id = ?", (p["user_id"],), fetch_one=True)
            provider_name = u_res.get("name") if u_res else "Service Provider"
        if not category_name:
            c_res = execute_query("SELECT name, icon FROM categories WHERE id = ?", (p["category_id"],), fetch_one=True)
            category_name = c_res.get("name") if c_res else "General"
            category_icon = c_res.get("icon") if c_res else "Wrench"

        p["provider_name"] = provider_name
        p["category_name"] = category_name
        p["category_icon"] = category_icon

        if query:
            q_lower = query.lower()
            match = (
                q_lower in p["provider_name"].lower() or
                q_lower in p.get("bio", "").lower() or
                q_lower in p.get("services_offered", "").lower() or
                q_lower in p.get("location", "").lower()
            )
            if not match:
                continue

        unmask = should_unmask_contact(user_id, is_premium, p["id"], p["user_id"], role)
        p_copy = dict(p)
        p_copy["is_unlocked"] = unmask
        if not unmask:
            p_copy["phone"] = mask_phone(p.get("phone", ""))
            p_copy["email"] = mask_email(p.get("email", ""))

        processed.append(p_copy)

    processed.sort(key=lambda x: (x.get("rating", 0), x.get("total_reviews", 0)), reverse=True)

    return jsonify({"providers": processed}), 200


@providers_bp.route("/<int:provider_id>", methods=["GET"])
def get_provider_details(provider_id):
    db = get_mongo_db()
    provider = None
    if db is not None:
        try:
            provider = db.providers.find_one({"id": provider_id}, {"_id": 0})
        except Exception:
            provider = None

    if not provider:
        sql = """
        SELECT p.*, u.name as provider_name, c.name as category_name, c.icon as category_icon 
        FROM providers p
        JOIN users u ON p.user_id = u.id
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
        """
        provider = execute_query(sql, (provider_id,), fetch_one=True)

    if not provider:
        return jsonify({"message": "Provider not found."}), 404

    auth_header = request.headers.get("Authorization")
    user_id = None
    is_premium = False
    role = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        payload = decode_token(token)
        if payload:
            user_id = payload.get("user_id")
            role = payload.get("role")
            usr = execute_query("SELECT is_premium FROM users WHERE id = ?", (user_id,), fetch_one=True)
            if usr: is_premium = bool(usr.get("is_premium", 0))

    unmask = should_unmask_contact(user_id, is_premium, provider["id"], provider["user_id"], role)
    provider_res = dict(provider)
    provider_res["is_unlocked"] = unmask
    if not unmask:
        provider_res["phone"] = mask_phone(provider.get("phone", ""))
        provider_res["email"] = mask_email(provider.get("email", ""))

    reviews = execute_query("""
    SELECT r.*, u.name as reviewer_name 
    FROM reviews r 
    JOIN users u ON r.customer_id = u.id 
    WHERE r.provider_id = ?
    """, (provider_id,), fetch_all=True) or []

    provider_res["reviews"] = reviews

    return jsonify({"provider": provider_res}), 200


@providers_bp.route("/profile", methods=["PUT"])
@token_required
@role_required(["provider"])
def update_provider_profile(current_user):
    user_id = current_user["id"]
    data = request.get_json() or {}

    update_fields = {}
    for key in ["bio", "phone", "location", "services_offered"]:
        if key in data and data[key] is not None:
            update_fields[key] = data[key]

    if "hourly_rate" in data and data["hourly_rate"] is not None:
        update_fields["hourly_rate"] = float(data["hourly_rate"])

    if "experience_years" in data and data["experience_years"] is not None:
        update_fields["experience_years"] = int(data["experience_years"])

    if not update_fields:
        return jsonify({"message": "No fields to update."}), 400

    db = get_mongo_db()
    if db is not None:
        try:
            db.providers.update_one({"user_id": user_id}, {"$set": update_fields})
        except Exception:
            pass

    set_clauses = [f"{k} = ?" for k in update_fields.keys()]
    values = list(update_fields.values())
    values.append(user_id)
    execute_query(f"UPDATE providers SET {', '.join(set_clauses)} WHERE user_id = ?", tuple(values), commit=True)

    return jsonify({"message": "Provider profile updated successfully."}), 200
