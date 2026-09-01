from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.db import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize database
    with app.app_context():
        init_db()

    # Register Route Blueprints
    from app.routes.auth import auth_bp
    from app.routes.services import services_bp
    from app.routes.providers import providers_bp
    from app.routes.bookings import bookings_bp
    from app.routes.contacts import contacts_bp
    from app.routes.premium import premium_bp
    from app.routes.admin import admin_bp
    from app.routes.ai import ai_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(services_bp)
    app.register_blueprint(providers_bp)
    app.register_blueprint(bookings_bp)
    app.register_blueprint(contacts_bp)
    app.register_blueprint(premium_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(ai_bp)

    @app.route("/")
    def index():
        return {
            "name": "HomeServe Connect API",
            "version": "2.0.0",
            "database": "MongoDB Atlas",
            "currency": "INR (₹)",
            "ai_engine": "Google Gemini AI",
            "status": "online"
        }

    return app

# Expose app at package level so 'gunicorn app:app' works directly
app = create_app()
