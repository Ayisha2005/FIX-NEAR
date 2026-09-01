import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    PORT = int(os.getenv("PORT", 5000))
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
    JWT_SECRET = os.getenv("JWT_SECRET", "homeserve_connect_super_secret_jwt_key_2026!")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://ayeshaaaaap09_db_user:nBzl2k71klZ4F6BG@cluster0.zx7bkd9.mongodb.net/?appName=Cluster0").strip()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    
    DATABASE_URL = os.getenv("DATABASE_URL", "").strip()
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    SQLITE_DB_PATH = os.path.join(BASE_DIR, "homeserve.db")
