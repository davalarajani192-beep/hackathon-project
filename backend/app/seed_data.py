import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal, init_db
from app.models import User, Listing, AuditLog
from app.auth import hash_password

def seed_database():
    """Populates realistic demo data with donors, receivers, listings, and audit history."""
    init_db()
    db: Session = SessionLocal()
    
    # Check if already seeded
    if db.query(User).count() > 0:
        print("[Seed] Database already seeded. Skipping.")
        db.close()
        return

    print("[Seed] Populating initial demo data...")
    now = datetime.datetime.utcnow()

    # 1. Users: Donors, Receivers, Admin
    users = [
        User(
            email="donor@canteen.org",
            hashed_password=hash_password("donor123"),
            role="donor",
            org_name="Grand Horizon Banquet & Catering",
            org_type="Banquet Hall",
            phone="+91 98450 12345",
            address="14 Raj Bhavan Road, Somajiguda, Hyderabad",
            latitude=17.4239,
            longitude=78.4611,
            default_radius_km=12.0,
            created_at=now - datetime.timedelta(days=10)
        ),
        User(
            email="campus@canteen.org",
            hashed_password=hash_password("donor123"),
            role="donor",
            org_name="Campus Central Canteen & Cafeteria",
            org_type="Canteen",
            phone="+91 98450 67890",
            address="Tech Park Avenue, Hitec City, Hyderabad",
            latitude=17.4474,
            longitude=78.3762,
            default_radius_km=10.0,
            created_at=now - datetime.timedelta(days=7)
        ),
        User(
            email="grocer@freshmart.org",
            hashed_password=hash_password("donor123"),
            role="donor",
            org_name="FreshMart Metro Grocers",
            org_type="Grocer",
            phone="+91 98450 54321",
            address="Banjara Hills Road No. 1, Hyderabad",
            latitude=17.4156,
            longitude=78.4350,
            default_radius_km=8.0,
            created_at=now - datetime.timedelta(days=5)
        ),
        User(
            email="receiver@foodbank.org",
            hashed_password=hash_password("receiver123"),
            role="receiver",
            org_name="City Hope Food Bank & Distribution Hub",
            org_type="Food Bank",
            phone="+91 98451 11223",
            address="Greenlands Road, Begumpet, Hyderabad",
            latitude=17.4385,
            longitude=78.4554,
            capacity_meals=300.0,
            has_cold_storage=True,
            created_at=now - datetime.timedelta(days=12)
        ),
        User(
            email="grace@kitchen.org",
            hashed_password=hash_password("receiver123"),
            role="receiver",
            org_name="Grace Community Kitchen & Shelter",
            org_type="Community Kitchen",
            phone="+91 98451 44556",
            address="Panjagutta Main Circle, Hyderabad",
            latitude=17.4265,
            longitude=78.4510,
            capacity_meals=120.0,
            has_cold_storage=False,
            created_at=now - datetime.timedelta(days=8)
        ),
        User(
            email="seva@shelter.org",
            hashed_password=hash_password("receiver123"),
            role="receiver",
            org_name="Seva Night Shelter & Hunger Mission",
            org_type="Shelter",
            phone="+91 98451 99887",
            address="Khairatabad Junction, Hyderabad",
            latitude=17.4111,
            longitude=78.4619,
            capacity_meals=60.0,
            has_cold_storage=False,
            created_at=now - datetime.timedelta(days=6)
        ),
        User(
            email="admin@easyrescue.org",
            hashed_password=hash_password("admin123"),
            role="admin",
            org_name="Decoders EASY Admin Team",
            org_type="NGO Consortium Admin",
            phone="+91 98452 00000",
            address="Decoders Command Center, Hyderabad",
            latitude=17.4300,
            longitude=78.4500,
            created_at=now - datetime.timedelta(days=30)
        )
    ]
    db.add_all(users)
    db.commit()

    # Query back users for referencing
    donor1 = db.query(User).filter_by(email="donor@canteen.org").first()
    donor2 = db.query(User).filter_by(email="campus@canteen.org").first()
    donor3 = db.query(User).filter_by(email="grocer@freshmart.org").first()
    receiver1 = db.query(User).filter_by(email="receiver@foodbank.org").first()
    receiver2 = db.query(User).filter_by(email="grace@kitchen.org").first()

    # 2. Realistic Listings with varying shelf life and status workflow
    listings = [
        # Item 1: Listed, fresh cooked meal, urgent expiry in 2.5 hours
        Listing(
            donor_id=donor1.id,
            title="Fresh Paneer Pulao, Dal Makhani & Roti Trays",
            category="Cooked Meals",
            quantity=85.0,
            unit="meals",
            storage_type="ambient",
            dietary_info="Vegetarian",
            expiry_time=now + datetime.timedelta(hours=2, minutes=30),
            listed_at=now - datetime.timedelta(minutes=45),
            pickup_address=donor1.address,
            latitude=donor1.latitude,
            longitude=donor1.longitude,
            pickup_radius_km=12.0,
            status="Listed",
            notes="Prepared for corporate lunch seminar at 12:30 PM. Stored in hot insulation trays. Ready for immediate pickup."
        ),
        # Item 2: Listed, bakery items, 6 hours expiry
        Listing(
            donor_id=donor2.id,
            title="Assorted Fresh Sourdough Loaves, Croissants & Bread",
            category="Bakery & Bread",
            quantity=45.0,
            unit="kg",
            storage_type="ambient",
            dietary_info="Vegetarian",
            expiry_time=now + datetime.timedelta(hours=6, minutes=15),
            listed_at=now - datetime.timedelta(hours=1, minutes=10),
            pickup_address=donor2.address,
            latitude=donor2.latitude,
            longitude=donor2.longitude,
            pickup_radius_km=10.0,
            status="Listed",
            notes="Baked fresh early morning. Packed in food-grade kraft bags."
        ),
        # Item 3: Listed, Dairy & Cold - requires chilled storage, 3.5 hours expiry
        Listing(
            donor_id=donor3.id,
            title="Fresh Pasteurized Milk Packets & Organic Yogurt",
            category="Dairy & Cold",
            quantity=60.0,
            unit="meals",
            storage_type="chilled",
            dietary_info="Vegetarian",
            expiry_time=now + datetime.timedelta(hours=3, minutes=45),
            listed_at=now - datetime.timedelta(hours=2),
            pickup_address=donor3.address,
            latitude=donor3.latitude,
            longitude=donor3.longitude,
            pickup_radius_km=8.0,
            status="Listed",
            notes="Requires refrigerated transport van (kept at 4°C). Best consumed or distributed today."
        ),
        # Item 4: Accepted - Claimed by City Hope Food Bank, awaiting pickup
        Listing(
            donor_id=donor1.id,
            title="Wedding Feast Vegetable Biryani & Mirchi Ka Salan",
            category="Cooked Meals",
            quantity=150.0,
            unit="meals",
            storage_type="ambient",
            dietary_info="Vegetarian",
            expiry_time=now + datetime.timedelta(hours=4),
            listed_at=now - datetime.timedelta(hours=2),
            pickup_address=donor1.address,
            latitude=donor1.latitude,
            longitude=donor1.longitude,
            pickup_radius_km=12.0,
            status="Accepted",
            claimed_by_id=receiver1.id,
            claimed_at=now - datetime.timedelta(minutes=30),
            notes="Claimed by City Hope Food Bank. Logistics team en route with insulated containers."
        ),
        # Item 5: Collected - Receiver picked it up, awaiting donor confirmation verification
        Listing(
            donor_id=donor2.id,
            title="Campus Canteen Snack Boxes & Sandwiches",
            category="Cooked Meals",
            quantity=50.0,
            unit="meals",
            storage_type="ambient",
            dietary_info="Vegetarian",
            expiry_time=now + datetime.timedelta(hours=1, minutes=45),
            listed_at=now - datetime.timedelta(hours=3),
            pickup_address=donor2.address,
            latitude=donor2.latitude,
            longitude=donor2.longitude,
            pickup_radius_km=10.0,
            status="Collected",
            claimed_by_id=receiver2.id,
            claimed_at=now - datetime.timedelta(hours=1, minutes=15),
            collected_at=now - datetime.timedelta(minutes=15),
            notes="Receiver collected food. Pending final donor verification."
        ),
        # Item 6: Verified - Fully completed and double verified by both sides!
        Listing(
            donor_id=donor1.id,
            title="Banquet High-Protein Dal Makhani, Jeera Rice & Naan",
            category="Cooked Meals",
            quantity=110.0,
            unit="meals",
            storage_type="ambient",
            dietary_info="Vegetarian",
            expiry_time=now - datetime.timedelta(hours=1),
            listed_at=now - datetime.timedelta(hours=6),
            pickup_address=donor1.address,
            latitude=donor1.latitude,
            longitude=donor1.longitude,
            pickup_radius_km=12.0,
            status="Verified",
            claimed_by_id=receiver1.id,
            claimed_at=now - datetime.timedelta(hours=4),
            collected_at=now - datetime.timedelta(hours=3),
            verified_at=now - datetime.timedelta(hours=2, minutes=30),
            notes="Successfully distributed to 110 families at Begumpet community centre."
        ),
        # Item 7: Expired - past timestamp, auto-expired
        Listing(
            donor_id=donor3.id,
            title="Fresh Sliced Melon & Papaya Fruit Bowls",
            category="Produce & Fresh",
            quantity=25.0,
            unit="kg",
            storage_type="chilled",
            dietary_info="Vegan",
            expiry_time=now - datetime.timedelta(hours=3),
            listed_at=now - datetime.timedelta(hours=9),
            pickup_address=donor3.address,
            latitude=donor3.latitude,
            longitude=donor3.longitude,
            pickup_radius_km=8.0,
            status="Expired",
            notes="Auto-expired because pickup window passed without confirmation."
        )
    ]
    db.add_all(listings)
    db.commit()

    # 3. Audit Logs recording history
    logs = [
        AuditLog(
            listing_id=1,
            user_id=donor1.id,
            user_role="donor",
            user_name=donor1.org_name,
            action="CREATED",
            details="Created surplus listing: 85 meals of Fresh Paneer Pulao & Dal Makhani. Expiry: 2.5h.",
            timestamp=now - datetime.timedelta(minutes=45)
        ),
        AuditLog(
            listing_id=4,
            user_id=donor1.id,
            user_role="donor",
            user_name=donor1.org_name,
            action="CREATED",
            details="Created surplus listing: 150 meals of Wedding Feast Vegetable Biryani.",
            timestamp=now - datetime.timedelta(hours=2)
        ),
        AuditLog(
            listing_id=4,
            user_id=receiver1.id,
            user_role="receiver",
            user_name=receiver1.org_name,
            action="ACCEPTED",
            details="Claimed listing. Assigned dispatch vehicle for 150 meals pickup within 45 minutes.",
            timestamp=now - datetime.timedelta(minutes=30)
        ),
        AuditLog(
            listing_id=5,
            user_id=receiver2.id,
            user_role="receiver",
            user_name=receiver2.org_name,
            action="COLLECTED",
            details="Marked 50 snack boxes as picked up from Campus Canteen. Awaiting donor confirmation.",
            timestamp=now - datetime.timedelta(minutes=15)
        ),
        AuditLog(
            listing_id=6,
            user_id=donor1.id,
            user_role="donor",
            user_name=donor1.org_name,
            action="VERIFIED",
            details="Confirmed mutual verification: 110 meals successfully handed over to City Hope Food Bank.",
            timestamp=now - datetime.timedelta(hours=2, minutes=30)
        ),
        AuditLog(
            listing_id=7,
            user_id=None,
            user_role="system",
            user_name="Auto-Expiry Scheduler",
            action="EXPIRED",
            details="Listing 'Fresh Sliced Melon & Papaya Fruit Bowls' automatically expired at deadline.",
            timestamp=now - datetime.timedelta(hours=3)
        )
    ]
    db.add_all(logs)
    db.commit()
    db.close()
    print("[Seed] Successfully seeded initial users, listings, and audit trail!")

if __name__ == "__main__":
    seed_database()
