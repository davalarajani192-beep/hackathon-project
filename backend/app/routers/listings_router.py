import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Listing, User, AuditLog
from app.schemas import ListingCreate, ListingResponse
from app.auth import get_current_user, require_donor, require_receiver, require_admin
from app.scheduler import check_and_expire_listings

router = APIRouter(prefix="/api/listings", tags=["Listings"])

def serialize_listing(item: Listing) -> ListingResponse:
    donor = item.donor
    claimed = item.claimed_by
    return ListingResponse(
        id=item.id,
        donor_id=item.donor_id,
        donor_name=donor.org_name if donor else "Unknown Donor",
        donor_phone=donor.phone if donor else None,
        donor_address=donor.address if donor else item.pickup_address,
        title=item.title,
        category=item.category,
        quantity=item.quantity,
        unit=item.unit,
        storage_type=item.storage_type,
        dietary_info=item.dietary_info,
        expiry_time=item.expiry_time,
        listed_at=item.listed_at,
        pickup_address=item.pickup_address,
        latitude=item.latitude,
        longitude=item.longitude,
        pickup_radius_km=item.pickup_radius_km,
        status=item.status,
        claimed_by_id=item.claimed_by_id,
        claimed_by_name=claimed.org_name if claimed else None,
        claimed_at=item.claimed_at,
        collected_at=item.collected_at,
        verified_at=item.verified_at,
        notes=item.notes,
        openfoodfacts_code=item.openfoodfacts_code,
    )

@router.get("", response_model=List[ListingResponse])
def get_listings(
    category: Optional[str] = None,
    storage_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    donor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Listing)
    
    if category:
        query = query.filter(Listing.category == category)
    if storage_type:
        query = query.filter(Listing.storage_type == storage_type)
    if status_filter:
        query = query.filter(Listing.status == status_filter)
    if donor_id:
        query = query.filter(Listing.donor_id == donor_id)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            (Listing.title.ilike(search_fmt)) |
            (Listing.pickup_address.ilike(search_fmt)) |
            (Listing.category.ilike(search_fmt))
        )
        
    items = query.order_by(Listing.listed_at.desc()).all()
    return [serialize_listing(item) for item in items]

@router.post("", response_model=ListingResponse, status_code=status.HTTP_201_CREATED)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    now = datetime.datetime.utcnow()
    # Check expiry time is in future
    if payload.expiry_time <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry time must be in the future."
        )
        
    listing = Listing(
        donor_id=current_user.id,
        title=payload.title,
        category=payload.category,
        quantity=payload.quantity,
        unit=payload.unit,
        storage_type=payload.storage_type,
        dietary_info=payload.dietary_info or "Standard",
        expiry_time=payload.expiry_time,
        listed_at=now,
        pickup_address=payload.pickup_address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        pickup_radius_km=payload.pickup_radius_km,
        status="Listed",
        notes=payload.notes,
        openfoodfacts_code=payload.openfoodfacts_code
    )
    db.add(listing)
    db.commit()
    db.refresh(listing)
    
    # Audit log
    audit = AuditLog(
        listing_id=listing.id,
        user_id=current_user.id,
        user_role=current_user.role,
        user_name=current_user.org_name,
        action="CREATED",
        details=f"Listed surplus: {listing.quantity} {listing.unit} of '{listing.title}', radius {listing.pickup_radius_km}km, storage {listing.storage_type}"
    )
    db.add(audit)
    db.commit()
    
    return serialize_listing(listing)

@router.get("/{listing_id}", response_model=ListingResponse)
def get_listing_detail(listing_id: int, db: Session = Depends(get_db)):
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
    return serialize_listing(item)

@router.post("/{listing_id}/accept", response_model=ListingResponse)
def accept_listing(
    listing_id: int,
    current_user: User = Depends(require_receiver),
    db: Session = Depends(get_db)
):
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        
    if item.status != "Listed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot claim listing with status '{item.status}'. Only 'Listed' items can be claimed."
        )
        
    now = datetime.datetime.utcnow()
    if item.expiry_time <= now:
        item.status = "Expired"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This listing has expired and cannot be accepted."
        )
        
    item.status = "Accepted"
    item.claimed_by_id = current_user.id
    item.claimed_at = now
    
    # Audit log
    audit = AuditLog(
        listing_id=item.id,
        user_id=current_user.id,
        user_role=current_user.role,
        user_name=current_user.org_name,
        action="ACCEPTED",
        details=f"Accepted listing '{item.title}' ({item.quantity} {item.unit}) for pickup."
    )
    db.add(audit)
    db.commit()
    db.refresh(item)
    
    return serialize_listing(item)

@router.post("/{listing_id}/collect", response_model=ListingResponse)
def mark_collected(
    listing_id: int,
    current_user: User = Depends(require_receiver),
    db: Session = Depends(get_db)
):
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        
    if item.status != "Accepted":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark collected from status '{item.status}'. Must be 'Accepted'."
        )
        
    if current_user.role != "admin" and item.claimed_by_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the receiver who claimed this listing can mark it collected."
        )
        
    now = datetime.datetime.utcnow()
    item.status = "Collected"
    item.collected_at = now
    
    # Audit log
    audit = AuditLog(
        listing_id=item.id,
        user_id=current_user.id,
        user_role=current_user.role,
        user_name=current_user.org_name,
        action="COLLECTED",
        details=f"Receiver '{current_user.org_name}' marked food collected at donor facility. Awaiting donor verification."
    )
    db.add(audit)
    db.commit()
    db.refresh(item)
    
    return serialize_listing(item)

@router.post("/{listing_id}/verify", response_model=ListingResponse)
def verify_collection(
    listing_id: int,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        
    if item.status != "Collected":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot verify collection from status '{item.status}'. Must be 'Collected' first."
        )
        
    if current_user.role != "admin" and item.donor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the donor who posted this listing can confirm verification."
        )
        
    now = datetime.datetime.utcnow()
    item.status = "Verified"
    item.verified_at = now
    
    # Audit log
    claimed_name = item.claimed_by.org_name if item.claimed_by else "Receiver"
    audit = AuditLog(
        listing_id=item.id,
        user_id=current_user.id,
        user_role=current_user.role,
        user_name=current_user.org_name,
        action="VERIFIED",
        details=f"Donor '{current_user.org_name}' confirmed verified handover of {item.quantity} {item.unit} to '{claimed_name}'. Mutual double-confirmation complete!"
    )
    db.add(audit)
    db.commit()
    db.refresh(item)
    
    return serialize_listing(item)

@router.post("/check-expiry")
def trigger_expiry_check(current_user: User = Depends(get_current_user)):
    count = check_and_expire_listings()
    return {"status": "ok", "expired_count": count}
