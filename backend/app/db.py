import os
import sqlite3
import time
from pymongo import MongoClient
from app.config import Config

_mongo_client = None

def get_mongo_client():
    global _mongo_client
    if _mongo_client is None:
        mongo_uri = Config.MONGO_URI
        print(f"Connecting to MongoDB Atlas at {mongo_uri[:35]}...")
        _mongo_client = MongoClient(
            mongo_uri,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=15000,
            connectTimeoutMS=15000,
            socketTimeoutMS=30000,
            retryWrites=True
        )
    return _mongo_client

def check_mongo():
    try:
        client = get_mongo_client()
        client.admin.command("ping")
        return True
    except Exception as e:
        print(f"MongoDB Atlas ping check warning ({e}). Re-attempting connection...")
        # Reset client to force reconnection
        global _mongo_client
        _mongo_client = None
        try:
            client = get_mongo_client()
            client.admin.command("ping")
            return True
        except Exception as e2:
            print(f"MongoDB Atlas reconnection failed ({e2}). Using local SQLite fallback.")
            return False

def get_mongo_db():
    try:
        client = get_mongo_client()
        return client["homeserve_db"]
    except Exception as e:
        print(f"get_mongo_db exception ({e})")
        return None

def get_next_sequence(sequence_name):
    # Always attempt Mongo sequence first
    for attempt in range(2):
        try:
            db = get_mongo_db()
            if db is not None:
                seq = db.counters.find_one_and_update(
                    {"_id": sequence_name},
                    {"$inc": {"seq": 1}},
                    upsert=True,
                    return_document=True
                )
                if seq and "seq" in seq:
                    return seq["seq"]
        except Exception as e:
            print(f"Mongo sequence attempt {attempt+1} error:", e)
            global _mongo_client
            _mongo_client = None
            time.sleep(0.5)

    # SQLite sequence fallback
    res = execute_query(f"SELECT MAX(id) as max_id FROM {sequence_name}", fetch_one=True)
    max_id = (res.get("max_id") or 0) if res else 0
    return max_id + 1

def init_db():
    schema_path = os.path.join(Config.BASE_DIR, "schema.sql")
    if os.path.exists(schema_path):
        try:
            with open(schema_path, "r", encoding="utf-8") as f:
                schema_sql = f.read()
            conn = sqlite3.connect(Config.SQLITE_DB_PATH)
            conn.executescript(schema_sql)
            conn.commit()
            conn.close()
        except Exception as err:
            print("SQLite schema init error:", err)

    if check_mongo():
        print("Connected successfully to MongoDB Atlas database 'homeserve_db'.")
    else:
        print("Using local SQLite database fallback.")

def execute_query(sql, params=(), fetch_one=False, fetch_all=False, commit=False):
    conn = sqlite3.connect(Config.SQLITE_DB_PATH)
    def dict_factory(cursor, row):
        d = {}
        for idx, col in enumerate(cursor.description):
            d[col[0]] = row[idx]
        return d
    conn.row_factory = dict_factory
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute(sql, params)
    result = None
    if fetch_one:
        result = cursor.fetchone()
    elif fetch_all:
        result = cursor.fetchall()
    if commit:
        conn.commit()
        if cursor.lastrowid and not result:
            result = cursor.lastrowid
    conn.close()
    return result
