from flask import Blueprint, request, jsonify
from app.db import get_mongo_db, get_next_sequence
from app.utils.auth_decorator import token_required, role_required
from app.utils.security import mask_phone, mask_email

bookings_bp = Blueprint("bookings", __name__, url_prefix="/api/bookings")

@bookings_bp.route("", methods=["POST"])
@token_required
@role_required(["customer"])
def create_booking(current_user):
    db = get_mongo_db()
    customer_id = current_user["id"]
    data = request.get_json() or {}

    provider_id = int(data.get("provider_id", 0))
    service_date = data.get("service_date")
    service_time = data.get("service_time")
    notes = data.get("notes", "")

    if not provider_id or not service_date or not service_time:
        return jsonify({"message": "Provider ID, service date, and service time are required."}), 400

    provider = db.providers.find_one({"id": provider_id})
    if not provider:
        return jsonify({"message": "Provider not found."}), 404

    total_price = float(provider.get("hourly_rate", 500.0)) * 2.0
    booking_id = get_next_sequence("bookings")

    booking_doc = {
        "id": booking_id,
        "customer_id": customer_id,
        "provider_id": provider_id,
        "service_date": service_date,
        "service_time": service_time,
        "notes": notes,
        "status": "pending",
        "total_price": total_price
    }
    db.bookings.insert_one(booking_doc)

    return jsonify({
        "message": "Booking request submitted successfully.",
        "booking_id": booking_id,
        "status": "pending",
        "total_price": total_price
    }), 201


@bookings_bp.route("", methods=["GET"])
@token_required
def list_bookings(current_user):
    db = get_mongo_db()
    user_id = current_user["id"]
    role = current_user["role"]
    is_premium = bool(current_user.get("is_premium", 0))

    if role == "customer":
        bookings = list(db.bookings.find({"customer_id": user_id}, {"_id": 0}))
        for b in bookings:
            prov = db.providers.find_one({"id": b["provider_id"]})
            u_p = db.users.find_one({"id": prov["user_id"]}) if prov else None
            c = db.categories.find_one({"id": prov["category_id"]}) if prov else None
            rev = db.reviews.find_one({"booking_id": b["id"]})

            b["provider_name"] = u_p["name"] if u_p else "Service Provider"
            b["provider_phone"] = prov["phone"] if prov else "+91 98400 00000"
            b["provider_email"] = prov["email"] if prov else "pro@homeserve.com"
            b["provider_location"] = prov["location"] if prov else "India"
            b["category_name"] = c["name"] if c else "General"
            b["category_icon"] = c["icon"] if c else "Wrench"
            if rev:
                b["review_id"] = rev["id"]
                b["review_rating"] = rev["rating"]
                b["review_comment"] = rev["comment"]

            unlocked = db.contact_unlocks.find_one({"customer_id": user_id, "provider_id": b["provider_id"]})
            is_unlocked = is_premium or bool(unlocked)
            b["is_unlocked"] = is_unlocked
            if not is_unlocked:
                b["provider_phone"] = mask_phone(b["provider_phone"])
                b["provider_email"] = mask_email(b["provider_email"])

    elif role == "provider":
        prov = db.providers.find_one({"user_id": user_id})
        if not prov:
            return jsonify({"bookings": []}), 200

        bookings = list(db.bookings.find({"provider_id": prov["id"]}, {"_id": 0}))
        for b in bookings:
            u_c = db.users.find_one({"id": b["customer_id"]})
            c = db.categories.find_one({"id": prov["category_id"]})
            rev = db.reviews.find_one({"booking_id": b["id"]})

            b["customer_name"] = u_c["name"] if u_c else "Customer"
            b["customer_email"] = u_c["email"] if u_c else "customer@homeserve.com"
            b["category_name"] = c["name"] if c else "General"
            b["category_icon"] = c["icon"] if c else "Wrench"
            if rev:
                b["review_id"] = rev["id"]
                b["review_rating"] = rev["rating"]
                b["review_comment"] = rev["comment"]

    else:  # Admin
        bookings = list(db.bookings.find({}, {"_id": 0}))
        for b in bookings:
            u_c = db.users.find_one({"id": b["customer_id"]})
            prov = db.providers.find_one({"id": b["provider_id"]})
            u_p = db.users.find_one({"id": prov["user_id"]}) if prov else None
            c = db.categories.find_one({"id": prov["category_id"]}) if prov else None

            b["customer_name"] = u_c["name"] if u_c else "Customer"
            b["provider_name"] = u_p["name"] if u_p else "Provider"
            b["category_name"] = c["name"] if c else "General"

    bookings.sort(key=lambda x: x.get("id", 0), reverse=True)
    return jsonify({"bookings": bookings}), 200


@bookings_bp.route("/<int:booking_id>/status", methods=["PUT"])
@token_required
def update_booking_status(current_user, booking_id):
    db = get_mongo_db()
    data = request.get_json() or {}
    new_status = data.get("status", "").lower()

    if new_status not in ["accepted", "rejected", "completed", "cancelled"]:
        return jsonify({"message": "Invalid booking status."}), 400

    booking = db.bookings.find_one({"id": booking_id})
    if not booking:
        return jsonify({"message": "Booking not found."}), 404

    role = current_user["role"]
    user_id = current_user["id"]

    if role == "provider":
        prov = db.providers.find_one({"user_id": user_id})
        if not prov or prov["id"] != booking["provider_id"]:
            return jsonify({"message": "Unauthorized to update this booking."}), 403
    elif role == "customer":
        if booking["customer_id"] != user_id:
            return jsonify({"message": "Unauthorized to update this booking."}), 403
        if new_status not in ["cancelled"]:
            return jsonify({"message": "Customers can only cancel pending bookings."}), 400

    db.bookings.update_one({"id": booking_id}, {"$set": {"status": new_status}})
    return jsonify({"message": f"Booking status updated to {new_status}."}), 200


@bookings_bp.route("/<int:booking_id>/reviews", methods=["POST"])
@token_required
@role_required(["customer"])
def add_booking_review(current_user, booking_id):
    db = get_mongo_db()
    user_id = current_user["id"]
    data = request.get_json() or {}

    rating = int(data.get("rating", 5))
    comment = data.get("comment", "").strip()

    if rating < 1 or rating > 5:
        return jsonify({"message": "Rating must be between 1 and 5 stars."}), 400

    booking = db.bookings.find_one({"id": booking_id})
    if not booking or booking["customer_id"] != user_id:
        return jsonify({"message": "Booking not found or access denied."}), 404

    if booking["status"] != "completed":
        return jsonify({"message": "Can only review completed bookings."}), 400

    existing_review = db.reviews.find_one({"booking_id": booking_id})
    if existing_review:
        return jsonify({"message": "You have already submitted a review for this booking."}), 400

    review_id = get_next_sequence("reviews")
    review_doc = {
        "id": review_id,
        "booking_id": booking_id,
        "customer_id": user_id,
        "provider_id": booking["provider_id"],
        "rating": rating,
        "comment": comment
    }
    db.reviews.insert_one(review_doc)

    # Recalculate rating & review count for provider
    revs = list(db.reviews.find({"provider_id": booking["provider_id"]}))
    if revs:
        avg_r = round(sum(r["rating"] for r in revs) / len(revs), 1)
        db.providers.update_one(
            {"id": booking["provider_id"]},
            {"$set": {"rating": avg_r, "total_reviews": len(revs)}}
        )

    return jsonify({"message": "Review submitted successfully.", "review_id": review_id}), 201
