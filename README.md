# 🛠️ HomeServe Connect - Full-Stack Home Service Marketplace Platform

HomeServe Connect is a modern, professional home-service marketplace and premium contact platform built with **React, Vite, Tailwind CSS, Python Flask, MongoDB Atlas, and OpenStreetMap**.

---

## 📁 Repository Structure

```text
FIX-NEAR/
├── frontend/                  # React 18 + Vite + Tailwind CSS Frontend Application
│   ├── src/
│   │   ├── components/        # ProviderMap (OpenStreetMap), Navbar, Footer, Modals, SideAIChatbox
│   │   ├── pages/             # Home, Search, ProviderProfile, CustomerDashboard, ProviderDashboard, AdminDashboard, PremiumSubscription, Login, Register
│   │   ├── context/           # AuthContext (JWT Authentication & Session persistence)
│   │   └── services/          # Axios API layer
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                   # Python Flask REST API & Database Layer
│   ├── app/
│   │   ├── routes/            # Auth, Services, Providers, Bookings, Contacts, Premium, Admin, AI
│   │   ├── utils/             # JWT token security & role decorator
│   │   ├── config.py          # Configuration & MongoDB Atlas URI setup
│   │   └── db.py              # MongoDB Atlas connection & SQLite fallback
│   ├── app.py                 # Flask server entry point (Port 5000)
│   ├── seed.py                # Database seeder (Seeds Indian providers & coordinates)
│   ├── schema.sql             # SQL Schema definition
│   ├── requirements.txt       # Dependencies (pymongo, flask, bcrypt, pyjwt, certifi)
│   └── .env                   # Environment variables (Mongo URI & secrets)
│
└── README.md
```

---

## 🌟 Key Features

1. **🍃 MongoDB Atlas Database Integration**:
   - URI: `mongodb+srv://ayeshaaaaap09_db_user:nBzl2k71klZ4F6BG@cluster0.zx7bkd9.mongodb.net/?appName=Cluster0`
   - Database: `homeserve_db`
   - Collections: `users`, `providers`, `categories`, `bookings`, `reviews`, `subscriptions`, `contact_unlocks`, `counters`.

2. **🇮🇳 Indian Rupees (₹ / INR) Currency & City Coverage**:
   - Standard Rates in **₹ INR** (e.g., ₹350/hr - ₹600/hr).
   - Subscription Passes: **₹499 / Month** | **₹3,999 / Year**.
   - Verified Service Coverage in **Chennai, Bengaluru, Mumbai, Delhi NCR**.

3. **🗺️ OpenStreetMap (Leaflet.js)**:
   - Interactive Leaflet map (`ProviderMap.jsx`) with custom SVG badges.
   - Featured on Home Page, Search Page (Grid vs Map View toggle), and Provider Profile Pages.

4. **🤖 Google Gemini AI Side Chatbox**:
   - Collapsible right-edge side chatbox (`SideAIChatbox.jsx`).
   - Diagnoses home issues, provides severity warnings, safety steps, repair cost ranges in ₹, and one-tap provider booking links.

5. **🔐 Provider Contact Masking & Role-Based Access Control**:
   - Masked provider phone numbers and emails for standard users.
   - Direct unlock pass for Premium subscribers (₹499/mo).

---

## 🚀 Quick Setup & Installation

### 1. Backend Setup (Flask API)

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed MongoDB Atlas & local database
python seed.py

# Launch Flask server on port 5000
python app.py
```

### 2. Frontend Setup (React App)

```bash
cd frontend

# Install Node dependencies
npm install

# Launch Vite development server on port 3000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Account Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Customer (Standard)** | `alex@example.com` | `customer123` | Arun Kumar (Masked Contacts) |
| **Customer (Premium)** | `sarah@example.com` | `premium123` | Priya Sharma (Unlimited ₹499 Pass) |
| **Service Provider** | `david.plumbing@homeserve.com` | `provider123` | Karthik Raja (Master Plumber Chennai) |
| **Platform Admin** | `admin@homeserve.com` | `admin123` | Executive Admin Portal |
