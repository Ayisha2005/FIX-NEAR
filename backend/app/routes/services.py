from flask import Blueprint, jsonify
from app.db import get_mongo_db, execute_query

services_bp = Blueprint("services", __name__, url_prefix="/api/services")

@services_bp.route("/categories", methods=["GET"])
def get_categories():
    db = get_mongo_db()
    categories = []

    if db is not None:
        try:
            categories = list(db.categories.find({}, {"_id": 0}))
            for cat in categories:
                count = db.providers.count_documents({"category_id": cat["id"]})
                cat["provider_count"] = count
            return jsonify({"categories": categories}), 200
        except Exception:
            categories = []

    categories = execute_query("SELECT id, name, icon, description FROM categories ORDER BY id ASC", fetch_all=True) or []
    for cat in categories:
        count_res = execute_query("SELECT COUNT(*) as cnt FROM providers WHERE category_id = ?", (cat["id"],), fetch_one=True)
        cat["provider_count"] = count_res.get("cnt", 0) if count_res else 0

    return jsonify({"categories": categories}), 200
