import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Listing, User, AuditLog, Message
from app.schemas import ListingCreate, ListingResponse, TrackingUpdateRequest, MessageCreate, MessageResponse
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
        tracking_stage=item.tracking_stage or "Ready for Pickup",
        claimed_by_id=item.claimed_by_id,
        claimed_by_name=claimed.org_name if claimed else None,
        claimed_by_address=claimed.address if claimed else None,
        claimed_by_phone=claimed.phone if claimed else None,
        claimed_by_lat=claimed.latitude if claimed else None,
        claimed_by_lng=claimed.longitude if claimed else None,
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
    if payload.expiry_time <= now:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expiry date and time must be in the future."
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
        tracking_stage="Ready for Pickup",
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
        details=f"Listed surplus: {listing.quantity} {listing.unit} of '{listing.title}', expiry at {listing.expiry_time.strftime('%Y-%m-%d %H:%M')}, radius {listing.pickup_radius_km}km"
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
    item.tracking_stage = "Driver Dispatched"
    item.claimed_by_id = current_user.id
    item.claimed_at = now
    
    # Send automated message from Receiver to Donor
    msg = Message(
        listing_id=item.id,
        sender_id=current_user.id,
        recipient_id=item.donor_id,
        sender_name=current_user.org_name,
        recipient_name=item.donor.org_name if item.donor else "Donor",
        message_text=f"Claim Notification: {current_user.org_name} has accepted your surplus donation of '{item.title}' ({item.quantity} {item.unit}). Transport driver is being dispatched!"
    )
    db.add(msg)
    
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

@router.post("/{listing_id}/tracking", response_model=ListingResponse)
def update_tracking_stage(
    listing_id: int,
    req: TrackingUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        
    item.tracking_stage = req.tracking_stage
    
    # If set to in transit or delivered, update status if appropriate
    if req.tracking_stage == "In Transit" and item.status == "Accepted":
        item.status = "Accepted"
    elif req.tracking_stage == "Delivered" and item.status in ["Accepted", "Collected"]:
        item.status = "Collected"
        if not item.collected_at:
            item.collected_at = datetime.datetime.utcnow()
            
    db.commit()
    db.refresh(item)
    return serialize_listing(item)

@router.post("/{listing_id}/confirm-delivery", response_model=ListingResponse)
def confirm_food_received(
    listing_id: int,
    current_user: User = Depends(require_receiver),
    db: Session = Depends(get_db)
):
    """
    Receiver marks food as received:
    1. Sets tracking to 'Delivered'
    2. Sets status to 'Collected'
    3. Sends high-priority confirmation message to the donor that food was received!
    """
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        
    now = datetime.datetime.utcnow()
    item.status = "Collected"
    item.tracking_stage = "Delivered"
    item.collected_at = now
    
    # Automated message to donor confirming receipt
    msg = Message(
        listing_id=item.id,
        sender_id=current_user.id,
        recipient_id=item.donor_id,
        sender_name=current_user.org_name,
        recipient_name=item.donor.org_name if item.donor else "Commercial Donor",
        message_text=f"✅ FOOD RECEIVED CONFIRMATION: {current_user.org_name} has safely received and inspected {item.quantity} {item.unit} of '{item.title}'. The meals will now be distributed tonight. Thank you for your kindness!"
    )
    db.add(msg)
    
    # Audit log
    audit = AuditLog(
        listing_id=item.id,
        user_id=current_user.id,
        user_role=current_user.role,
        user_name=current_user.org_name,
        action="COLLECTED",
        details=f"Receiver '{current_user.org_name}' confirmed receipt of food surplus from donor '{item.donor.org_name if item.donor else 'Donor'}'. Notification sent to donor."
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
    return confirm_food_received(listing_id, current_user, db)

@router.post("/{listing_id}/verify", response_model=ListingResponse)
def verify_collection(
    listing_id: int,
    current_user: User = Depends(require_donor),
    db: Session = Depends(get_db)
):
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        
    now = datetime.datetime.utcnow()
    item.status = "Verified"
    item.tracking_stage = "Delivered & Verified"
    item.verified_at = now
    
    # Confirmation message
    claimed_name = item.claimed_by.org_name if item.claimed_by else "Receiver"
    msg = Message(
        listing_id=item.id,
        sender_id=current_user.id,
        recipient_id=item.claimed_by_id or 0,
        sender_name=current_user.org_name,
        recipient_name=claimed_name,
        message_text=f"🤝 HANDOVER VERIFIED: {current_user.org_name} confirmed the verified mutual handover of {item.quantity} {item.unit} of '{item.title}'. Impact logged!"
    )
    db.add(msg)
    
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

@router.get("/{listing_id}/messages", response_model=List[MessageResponse])
def get_listing_messages(listing_id: int, db: Session = Depends(get_db)):
    msgs = db.query(Message).filter(Message.listing_id == listing_id).order_by(Message.timestamp.asc()).all()
    return msgs

@router.post("/{listing_id}/messages", response_model=MessageResponse)
def post_listing_message(
    listing_id: int,
    msg_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(Listing).filter(Listing.id == listing_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Listing not found")
        
    recipient_id = item.claimed_by_id if current_user.id == item.donor_id else item.donor_id
    recipient_user = db.query(User).filter(User.id == recipient_id).first()
    recipient_name = recipient_user.org_name if recipient_user else "User"
    
    msg = Message(
        listing_id=item.id,
        sender_id=current_user.id,
        recipient_id=recipient_id or 0,
        sender_name=current_user.org_name,
        recipient_name=recipient_name,
        message_text=msg_data.message_text
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

@router.post("/check-expiry")
def trigger_expiry_check(current_user: User = Depends(get_current_user)):
    count = check_and_expire_listings()
    return {"status": "ok", "expired_count": count}
