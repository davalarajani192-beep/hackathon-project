# EASY – Food-Expiry Rescue and Local Surplus Exchange
> **Team Decoders:** Vindhya, Vineela, Sreenidhi, Gowtham  
> **Tagline:** *"Surplus today. A meal tonight."*

![EASY App Hero Banner](https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Executive Overview
**EASY** is a role-based, hyperlocal food rescue and surplus exchange platform designed to bridge the critical gap between commercial food providers and community hunger relief agencies before food reaches its safe expiry timestamp.

- **The Problem:** According to the **UNEP Food Waste Index Report 2024**, 1.05 billion tonnes of food was wasted globally in 2022 (approx. 19% of all food available to consumers). Much of commercial food waste is high-quality prepared food from canteens, banquet halls, and grocers that expires before traditional charities can mobilize.
- **The Solution:** EASY equips commercial donors with instant listing tools with live expiry countdowns and customizable pickup radius geofences. Nearby community kitchens and food banks receive prioritized smart-matched surplus with automated travel feasibility checks and dual-party confirmation.

---

## 🛠️ Tech Stack & Architectural Decisions

| Layer | Technology | Rationale / Highlights |
| :--- | :--- | :--- |
| **Frontend** | **React + Tailwind CSS (Vite)** | Blazing fast build, responsive phone-first design, rounded-2xl modern cards with soft shadows, Inter typography, customized brand theme palette. |
| **Maps** | **Leaflet + OpenStreetMap** | 100% free, zero paid API keys, interactive markers for donors & receivers, dynamic geofence radius circle overlays. |
| **Backend** | **FastAPI + SQLAlchemy** *(Chosen)* | We chose **FastAPI** over Django because: <br>1. Clean async route architecture with automatic interactive Swagger docs (`/docs`). <br>2. High-performance Pydantic v2 data validation and serialized schemas. <br>3. Native spatial execution with PostGIS (`ST_DWithin`, `ST_Distance`) without the notorious OSGeo4W / GDAL system C-library binary installation failures common on Windows dev machines. <br>4. Lightweight background scheduler for automatic listing expiry. |
| **Database** | **PostgreSQL + PostGIS** | Native spatial database (`postgis/postgis:16-3.4`) performing `ST_DWithin` and `ST_Distance` geofence radius filtering, with automatic spherical Haversine fallback for standalone environments. |
| **Auth** | **JWT (Bearer Token)** | Strict role-based access control (`donor`, `receiver`, `admin`) enforced both in the UI and at the backend API endpoints (403 Forbidden). |
| **DevOps** | **Docker Compose** | Multi-container configuration starting `db` (PostGIS), `backend` (FastAPI), and `frontend` (Vite / Nginx). |

---

## 📁 Project Structure
```
hackathon-project/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── routers/            # API route handlers
│   │   │   ├── admin_router.py
│   │   │   ├── auth_router.py
│   │   │   ├── listings_router.py
│   │   │   ├── matching_router.py
│   │   │   └── openfoodfacts_router.py
│   │   ├── auth.py             # JWT authentication
│   │   ├── config.py           # App settings
│   │   ├── database.py         # SQLAlchemy engine
│   │   ├── geo_utils.py        # Geospatial utilities
│   │   ├── main.py             # FastAPI entry point
│   │   ├── matching.py         # Smart matching pipeline
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── scheduler.py        # Background expiry scheduler
│   │   ├── schemas.py          # Pydantic schemas
│   │   └── seed_data.py        # Demo data seeder
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── CountdownTimer.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── StatusStepper.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/              # Route pages
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DonorDashboard.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LiveTrackingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── ReceiverDashboard.jsx
│   │   │   └── RegisterPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🎨 Design Theme Tokens
The visual design matches the pitch deck specifications:
- **Primary Dark Green:** `#14402F` (hero background, header, dark sections)
- **Mid Green:** `#3E8E6A` (icons, primary action buttons, positive states)
- **Light Card Background:** `#EDF3EF` (cards, metric tiles, pill badges)
- **Accent Orange:** `#F0922B` (countdown timers, CTA highlights, urgency alerts)
- **Secondary Blue:** `#2E86AB` (receiver badges, transit times, info markers)
- **Muted Mint Text:** `#9CC5AA` (subheadings and text on dark backgrounds)

---

## ⚡ The 4-Stage Smart Matching Pipeline
When a community receiver opens their feed, EASY executes a 4-stage matching pipeline:
1. **Geofence Radius Filter (`ST_DWithin`):** Evaluates distance between donor and receiver against the donor's set pickup radius (e.g. 10 km).
2. **Travel Feasibility Check:** Calculates estimated transit time at urban transit speed (30 km/h) plus a 15-minute handling buffer. If `travel_time > remaining_shelf_life`, the item is flagged.
3. **Capacity & Cold Storage Fit:** Checks if the listing quantity fits the receiver vehicle capacity (e.g. 300 meals). If the item requires chilled or frozen storage, verifies receiver has cold-storage facilities.
4. **Composite Priority Ranking:**
   $$\text{Score} = (0.40 \times \text{Proximity}) + (0.35 \times \text{Urgency}) + (0.25 \times \text{Capacity Fit})$$
   Listings failing any check are greyed out with an explanatory hover tooltip detailing the exact rejection reasons.

---

## 🤝 Verification Handshake Workflow
Every listing progresses through a timestamped stepper:
1. **`Listed`:** Posted by commercial donor with quantity, storage type, and expiry deadline.
2. **`Accepted`:** Claimed by receiver; vehicle dispatch triggered.
3. **`Collected`:** Receiver arrives on-site and marks food collected.
4. **`Verified`:** Commercial donor inspects and confirms handover. **Both parties must confirm for the meal count to become verified.**
5. **`Expired`:** If unclaimed when the expiry deadline passes, the background scheduler automatically marks it expired.

---

## 🚀 Quick Start Guide

### Option 1: Run with Docker Compose (Recommended)
Make sure Docker Desktop is running:
```bash
docker-compose up --build
```
- **Frontend App:** [http://localhost:5173](http://localhost:5173) or [http://localhost](http://localhost)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostGIS DB:** `localhost:5432` (db: `easy_rescue`, user: `postgres`)

---

### Option 2: Run Locally (Standalone)

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Note: If PostgreSQL is not running locally, the backend automatically connects to SQLite with seamless Haversine fallback.*

#### 2. Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Pre-Seeded Demo Credentials
For easy evaluation during hackathon judging, the top bar includes **1-Click Demo Role Switchers**:

| Role | Organization | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Donor** | Grand Horizon Banquet Hall | `donor@canteen.org` | `donor123` | Banquet & Catering, 12 km geofence |
| **Donor** | Campus Central Canteen | `campus@canteen.org` | `donor123` | Canteen & Cafeteria, 10 km geofence |
| **Receiver** | City Hope Food Bank | `receiver@foodbank.org` | `receiver123` | 300 meals capacity, Cold Storage: YES |
| **Receiver** | Grace Community Kitchen | `grace@kitchen.org` | `receiver123` | 120 meals capacity, Cold Storage: NO |
| **Admin** | Decoders EASY Admin | `admin@easyrescue.org` | `admin123` | Platform-wide metrics & audit trail |

---

## 📊 Platform Impact Metrics
- **UNEP CO₂ Equivalent:** Diverting 1 kg of food surplus from landfill prevents approx. 2.5 kg of greenhouse emissions (methane).
- **Audit Logging:** Every status change is immutably logged with timestamp, user ID, role, and action for corporate ESG and CSR compliance.

---

## 👥 Team Contribution Workflow

> **⚠️ IMPORTANT: All teammates MUST follow this workflow. Never push directly to `main`.**

### For New Teammates — Joining the Repository

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/hackathon-project.git
cd hackathon-project

# 2. Create your personal branch (use your name)
git checkout -b feature/your-name-feature

# 3. Install dependencies
cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..

# 4. Make your changes, then stage and commit
git add .
git commit -m "feat: description of what you built"

# 5. Push YOUR branch (never main!)
git push origin feature/your-name-feature

# 6. Open a Pull Request on GitHub for review
```

### Branch Naming Convention
| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/name-description` | `feature/vineela-donor-map` |
| Bug Fix | `fix/name-description` | `fix/gowtham-auth-bug` |
| UI/Style | `ui/name-description` | `ui/sreenidhi-landing-page` |

### Golden Rules
1. **Never push to `main` directly** — always use a feature branch + Pull Request.
2. **Pull latest changes** before starting work: `git pull origin main`
3. **Never commit** `.env` files, API keys, passwords, tokens, or database files.
4. **Never copy** your entire project folder over the repo — only add/modify specific files.
5. **Review diffs** before committing: `git diff` to see what changed.
6. **Resolve conflicts** carefully — don't blindly accept one side.

---
*Created by **Team Decoders (Vindhya, Vineela, Sreenidhi, Gowtham)** for the Hackathon.*
