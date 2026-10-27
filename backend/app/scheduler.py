import datetime
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Listing, AuditLog

def check_and_expire_listings() -> int:
    """
    Checks for all unclaimed listings whose expiry_time has passed,
    marks them as 'Expired', and writes an audit log record.
    Returns the count of expired items.
    """
    db: Session = SessionLocal()
    expired_count = 0
    try:
        now = datetime.datetime.utcnow()
        overdue_listings = db.query(Listing).filter(
            Listing.status == "Listed",
            Listing.expiry_time <= now
        ).all()
        
        for item in overdue_listings:
            item.status = "Expired"
            expired_count += 1
            
            # Record audit log
            audit = AuditLog(
                listing_id=item.id,
                user_id=None,
                user_role="system",
                user_name="Auto-Expiry Scheduler",
                action="EXPIRED",
                details=f"Listing '{item.title}' auto-expired as expiry deadline {item.expiry_time.strftime('%Y-%m-%d %H:%M UTC')} passed without claims."
            )
            db.add(audit)
            
        if expired_count > 0:
            db.commit()
            print(f"[Scheduler] Auto-expired {expired_count} surplus food listing(s).")
    except Exception as e:
        db.rollback()
        print(f"[Scheduler] Error running auto-expiry check: {e}")
    finally:
        db.close()
        
    return expired_count
