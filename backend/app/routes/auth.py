from flask import Blueprint, request, jsonify
from app.db import get_mongo_db, get_next_sequence, execute_query
from app.utils.security import hash_password, check_password
from app.utils.auth_decorator import generate_token, token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    role = data.get("role", "customer").lower()
    
    # Provider extra fields
    category_id = int(data.get("category_id", 1)) if data.get("category_id") else 1
    phone = data.get("phone", "+91 98400 11223")
    bio = data.get("bio", "Professional home service provider dedicated to quality home care in India.")
    hourly_rate = float(data.get("hourly_rate", 500.0))
    experience_years = int(data.get("experience_years", 3))
    location = data.get("location", "Chennai, Tamil Nadu")
    services_offered = data.get("services_offered", "Standard home repair & maintenance")

    if not name or not email or not password:
        return jsonify({"message": "Name, email, and password are required."}), 400

    if role not in ["customer", "provider", "admin"]:
        return jsonify({"message": "Invalid role specified."}), 400

    # Check existence in Mongo or SQLite
    existing_user = None
    try:
        db = get_mongo_db()
        if db is not None:
            existing_user = db.users.find_one({"email": email})
    except Exception:
        existing_user = None

    if not existing_user:
        existing_user = execute_query("SELECT id FROM users WHERE email = ?", (email,), fetch_one=True)

    if existing_user:
        return jsonify({"message": "User with this email already exists."}), 400

    hashed_pw = hash_password(password)
    user_id = get_next_sequence("users")

    user_doc = {
        "id": user_id,
        "name": name,
        "email": email,
        "password_hash": hashed_pw,
        "role": role,
        "is_premium": 0
    }

    # Write to MongoDB Atlas
    try:
        db = get_mongo_db()
        if db is not None:
            db.users.insert_one(user_doc)
            print(f"User #{user_id} ({email}) saved to MongoDB Atlas!")
    except Exception as e:
        print("Mongo user insert warning:", e)

    # Always write to SQLite
    execute_query(
        "INSERT OR REPLACE INTO users (id, name, email, password_hash, role, is_premium) VALUES (?, ?, ?, ?, ?, 0)",
        (user_id, name, email, hashed_pw, role),
        commit=True
    )

    if role == "provider":
        provider_id = get_next_sequence("providers")
        category_name = "General Maintenance"
        try:
            db = get_mongo_db()
            if db is not None:
                cat = db.categories.find_one({"id": category_id})
                if cat: category_name = cat["name"]
        except Exception:
            pass
        
        if category_name == "General Maintenance":
            cat_sql = execute_query("SELECT name FROM categories WHERE id = ?", (category_id,), fetch_one=True)
            if cat_sql: category_name = cat_sql["name"]

        prov_doc = {
            "id": provider_id,
            "user_id": user_id,
            "category_id": category_id,
            "category_name": category_name,
            "bio": bio,
            "hourly_rate": hourly_rate,
            "rating": 5.0,
            "total_reviews": 0,
            "phone": phone,
            "email": email,
            "experience_years": experience_years,
            "location": location,
            "lat": 13.0827,
            "lng": 80.2707,
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            "services_offered": services_offered
        }

        try:
            db = get_mongo_db()
            if db is not None:
                db.providers.insert_one(prov_doc)
        except Exception as e:
            print("Mongo provider insert warning:", e)

        execute_query(
            "INSERT OR REPLACE INTO providers (id, user_id, category_id, bio, hourly_rate, rating, total_reviews, phone, email, experience_years, location, lat, lng, avatar_url, services_offered) VALUES (?, ?, ?, ?, ?, 5.0, 0, ?, ?, ?, ?, 13.0827, 80.2707, ?, ?)",
            (provider_id, user_id, category_id, bio, hourly_rate, phone, email, experience_years, location, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", services_offered),
            commit=True
        )

    token = generate_token(user_id, role, name, 0)

    return jsonify({
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": role,
            "is_premium": 0
        }
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required."}), 400

    user = None
    try:
        db = get_mongo_db()
        if db is not None:
            user = db.users.find_one({"email": email})
    except Exception:
        user = None

    if not user:
        user = execute_query("SELECT id, name, email, password_hash, role, is_premium FROM users WHERE email = ?", (email,), fetch_one=True)

    if not user or not check_password(password, user["password_hash"]):
        return jsonify({"message": "Invalid email or password."}), 401

    token = generate_token(user["id"], user["role"], user["name"], user.get("is_premium", 0))

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "is_premium": bool(user.get("is_premium", 0))
        }
    }), 200


@auth_bp.route("/me", methods=["GET"])
@token_required
def get_current_user_profile(current_user):
    user_id = current_user["id"]
    role = current_user["role"]

    extra_info = {}
    if role == "provider":
        prov = None
        try:
            db = get_mongo_db()
            if db is not None:
                prov = db.providers.find_one({"user_id": user_id}, {"_id": 0})
        except Exception:
            prov = None
        
        if not prov:
            prov = execute_query("SELECT * FROM providers WHERE user_id = ?", (user_id,), fetch_one=True)
        
        if prov:
            extra_info["provider"] = prov

    return jsonify({
        "user": {
            "id": current_user["id"],
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
            "is_premium": bool(current_user.get("is_premium", 0)),
            **extra_info
        }
    }), 200
