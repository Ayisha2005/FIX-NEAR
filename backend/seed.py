import os
import sys
import sqlite3

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db import get_mongo_db, init_db, check_mongo, execute_query
from app.utils.security import hash_password
from app.config import Config

def seed_database():
    print("Initializing Database schema...")
    init_db()

    # 1. Always seed SQLite database
    print("Seeding local SQLite database ('homeserve.db')...")
    conn = sqlite3.connect(Config.SQLITE_DB_PATH)
    cursor = conn.cursor()

    cursor.execute("DELETE FROM reviews")
    cursor.execute("DELETE FROM contact_unlocks")
    cursor.execute("DELETE FROM bookings")
    cursor.execute("DELETE FROM subscriptions")
    cursor.execute("DELETE FROM providers")
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM categories")

    categories = [
        (1, "Plumbing & Pipe Repair", "Wrench", "Pipe repair, leak detection, water tank cleaning, and tap installation."),
        (2, "Electrical & Wiring", "Zap", "MCB repairs, switchboard wiring, EV charger installs, and fan fitting."),
        (3, "HVAC & AC Service", "Wind", "AC jet cleaning, gas charging, compressor repair, and duct maintenance."),
        (4, "Home Cleaning & Hygiene", "Sparkles", "Deep house sanitization, bathroom scrubbing, sofa shampooing, and kitchen cleaning."),
        (5, "Carpentry & Furniture", "Hammer", "Custom modular woodwork, door lock fixes, wardrobe repairs, and deck building."),
        (6, "Appliance Maintenance", "Tv", "Washing machine, refrigerator, microwave oven, and water purifier repair."),
        (7, "Painting & Wall Decor", "Paintbrush", "Interior distemper, Asian Paints exterior coating, damp proofing, and wall texture."),
        (8, "Landscaping & Gardening", "Trees", "Lawn mowing, terrace garden setup, tree pruning, and drip irrigation systems.")
    ]
    cursor.executemany("INSERT INTO categories (id, name, icon, description) VALUES (?, ?, ?, ?)", categories)

    admin_pw = hash_password("admin123")
    cust_pw = hash_password("customer123")
    prem_pw = hash_password("premium123")
    prov_pw = hash_password("provider123")

    cursor.execute("INSERT INTO users (id, name, email, password_hash, role, is_premium) VALUES (1, 'HomeServe Admin India', 'admin@homeserve.com', ?, 'admin', 1)", (admin_pw,))
    cursor.execute("INSERT INTO users (id, name, email, password_hash, role, is_premium) VALUES (2, 'Arun Kumar', 'alex@example.com', ?, 'customer', 0)", (cust_pw,))
    cursor.execute("INSERT INTO users (id, name, email, password_hash, role, is_premium) VALUES (3, 'Priya Sharma', 'sarah@example.com', ?, 'customer', 1)", (prem_pw,))

    providers_sql = [
        (1, 4, "Karthik Raja", "david.plumbing@homeserve.com", 1, "Plumbing & Pipe Repair", 450.0, 4.9, 68, "+91 98401 23456", 12, "Chennai, Tamil Nadu", 13.0827, 80.2707, "Licensed Master Plumber in Chennai. Specialist in underground leak detection and tap fittings.", "Drain Cleaning, Overhead Tank Wash, Tap Repair, Geyser Installation", "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"),
        (2, 5, "Rajesh Venkatesh", "elena.electric@homeserve.com", 2, "Electrical & Wiring", 550.0, 5.0, 92, "+91 98840 56789", 10, "Bengaluru, Karnataka", 12.9716, 77.5946, "Certified Electrical Contractor in Bengaluru. EV charger setup and MCB box upgrades.", "EV Charger Wiring, MCB Trip Repair, Inverter Fitting", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"),
        (3, 6, "Vikram Malhotra", "marcus.hvac@homeserve.com", 3, "HVAC & AC Service", 600.0, 4.85, 54, "+91 99100 12345", 8, "Mumbai, Maharashtra", 19.0760, 72.8777, "Split & Inverter AC specialist in Mumbai. Foam jet cleaning and R32 gas charging.", "AC Foam Jet Service, Gas Refill R32, Compressor Repair", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150")
    ]

    for p in providers_sql:
        cursor.execute("INSERT INTO users (id, name, email, password_hash, role, is_premium) VALUES (?, ?, ?, ?, 'provider', 0)", (p[1], p[2], p[3], prov_pw))
        cursor.execute("INSERT INTO providers (id, user_id, category_id, bio, hourly_rate, rating, total_reviews, phone, email, experience_years, location, lat, lng, avatar_url, services_offered) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                       (p[0], p[1], p[4], p[14], p[6], p[7], p[8], p[9], p[3], p[10], p[11], p[12], p[13], p[16], p[15]))

    cursor.execute("INSERT INTO bookings (id, customer_id, provider_id, service_date, service_time, notes, status, total_price) VALUES (1, 2, 1, '2026-09-10', '10:00 AM', 'Bathroom overhead tank outlet leaking water into ceiling.', 'completed', 900.00)")
    cursor.execute("INSERT INTO reviews (id, booking_id, customer_id, provider_id, rating, comment) VALUES (1, 1, 2, 1, 5, 'Karthik was super professional, arrived on time in Chennai, and replaced the leaking valve quickly!')")

    conn.commit()
    conn.close()
    print("SQLite database seeded successfully.")

    # 2. Seed Mongo if connected
    if check_mongo():
        try:
            db = get_mongo_db()
            db.users.delete_many({})
            db.categories.delete_many({})
            db.providers.delete_many({})
            db.bookings.delete_many({})
            db.reviews.delete_many({})
            db.subscriptions.delete_many({})
            db.contact_unlocks.delete_many({})
            db.counters.delete_many({})

            cat_objs = [{"id": c[0], "name": c[1], "icon": c[2], "description": c[3]} for c in categories]
            db.categories.insert_many(cat_objs)
            db.counters.insert_one({"_id": "categories", "seq": 8})

            db.users.insert_one({"id": 1, "name": "HomeServe Admin India", "email": "admin@homeserve.com", "password_hash": admin_pw, "role": "admin", "is_premium": 1})
            db.users.insert_one({"id": 2, "name": "Arun Kumar", "email": "alex@example.com", "password_hash": cust_pw, "role": "customer", "is_premium": 0})
            db.users.insert_one({"id": 3, "name": "Priya Sharma", "email": "sarah@example.com", "password_hash": prem_pw, "role": "customer", "is_premium": 1})

            for p in providers_sql:
                db.users.insert_one({"id": p[1], "name": p[2], "email": p[3], "password_hash": prov_pw, "role": "provider", "is_premium": 0})
                db.providers.insert_one({
                    "id": p[0], "user_id": p[1], "category_id": p[4], "category_name": p[5],
                    "bio": p[14], "hourly_rate": p[6], "rating": p[7], "total_reviews": p[8],
                    "phone": p[9], "email": p[3], "experience_years": p[10], "location": p[11],
                    "lat": p[12], "lng": p[13], "avatar_url": p[16], "services_offered": p[15]
                })

            db.counters.insert_one({"_id": "users", "seq": 6})
            db.counters.insert_one({"_id": "providers", "seq": 3})
            print("MongoDB Atlas seeded successfully.")
        except Exception as e:
            print("MongoDB Atlas seed warning:", e)

if __name__ == "__main__":
    seed_database()
