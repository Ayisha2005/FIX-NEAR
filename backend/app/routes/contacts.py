from flask import Blueprint, request, jsonify
from app.db import get_mongo_db, get_next_sequence
from app.utils.auth_decorator import token_required, role_required

contacts_bp = Blueprint("contacts", __name__, url_prefix="/api/contacts")

@contacts_bp.route("/unlock", methods=["POST"])
@token_required
@role_required(["customer"])
def unlock_contact(current_user):
    db = get_mongo_db()
    user_id = current_user["id"]
    data = request.get_json() or {}
    provider_id = int(data.get("provider_id", 0))

    if not provider_id:
        return jsonify({"message": "Provider ID is required."}), 400

    provider = db.providers.find_one({"id": provider_id}, {"_id": 0})
    if not provider:
        return jsonify({"message": "Provider not found."}), 404

    existing = db.contact_unlocks.find_one({"customer_id": user_id, "provider_id": provider_id})
    if not existing:
        unlock_id = get_next_sequence("contact_unlocks")
        db.contact_unlocks.insert_one({
            "id": unlock_id,
            "customer_id": user_id,
            "provider_id": provider_id
        })

    return jsonify({
        "message": "Contact details unlocked successfully!",
        "contact": {
            "phone": provider["phone"],
            "email": provider["email"]
        }
    }), 200


@contacts_bp.route("/unlocked", methods=["GET"])
@token_required
@role_required(["customer"])
def get_unlocked_contacts(current_user):
    db = get_mongo_db()
    user_id = current_user["id"]
    is_premium = bool(current_user.get("is_premium", 0))

    if is_premium:
        providers = list(db.providers.find({}, {"_id": 0}))
    else:
        unlocks = list(db.contact_unlocks.find({"customer_id": user_id}))
        p_ids = [u["provider_id"] for u in unlocks]
        providers = list(db.providers.find({"id": {"$in": p_ids}}, {"_id": 0}))

    for p in providers:
        u = db.users.find_one({"id": p["user_id"]})
        c = db.categories.find_one({"id": p["category_id"]})
        p["provider_name"] = u["name"] if u else "Service Provider"
        p["category_name"] = c["name"] if c else "General"
        p["category_icon"] = c["icon"] if c else "Wrench"

    return jsonify({"unlocked_providers": providers}), 200
