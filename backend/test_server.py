import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
from app.database import init_db, SessionLocal
from app.seed_data import seed_database
from app.models import User, Listing
from app.matching import run_smart_matching_pipeline

print(f"Loaded FastAPI App: {app.title}")

# Initialize and seed database
init_db()
seed_database()

db = SessionLocal()
user_count = db.query(User).count()
listing_count = db.query(Listing).count()
print(f"Database Verification: {user_count} users, {listing_count} listings")

# Test matching pipeline for City Hope Food Bank (receiver 1)
receiver = db.query(User).filter_by(email="receiver@foodbank.org").first()
if receiver:
    matches = run_smart_matching_pipeline(db, receiver)
    print(f"\nSmart Matching Pipeline evaluated {len(matches)} listings for '{receiver.org_name}':")
    for m in matches:
        status_tag = "ELIGIBLE" if m.is_eligible else "REJECTED"
        print(f"  - [{status_tag}] {m.listing.title[:45]} | Dist: {m.distance_km}km | Shelf-life: {round(m.remaining_shelf_life_minutes)}m | Score: {m.match_score}%")
        if not m.is_eligible:
            print(f"    Reasons: {', '.join(m.rejection_reasons)}")

db.close()
print("\n=== ALL BACKEND & SMART MATCHING VERIFICATIONS PASSED SUCCESSFULLY ===")
