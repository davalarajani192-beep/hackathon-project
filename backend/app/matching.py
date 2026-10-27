import datetime
from typing import List, Tuple
from sqlalchemy.orm import Session
from app.models import Listing, User
from app.schemas import SmartMatchedListing, MatchPipelineCheck, ListingResponse
from app.geo_utils import haversine_distance_km, calculate_travel_time_minutes

def run_smart_matching_pipeline(
    db: Session,
    receiver: User,
    include_ineligible: bool = True
) -> List[SmartMatchedListing]:
    """
    Executes the 4-Stage Smart Matching Pipeline for the given receiver:
    1. Filter: Radius geofence (receiver must be inside donor's pickup radius)
    2. Feasibility: Travel time (distance @ 30km/h + 15m buffer) must fit inside remaining shelf-life
    3. Capacity & Storage: Listing quantity fits receiver capacity; cold items need cold storage
    4. Rank: Scored composite of distance, quantity fit, and urgency.
    """
    now = datetime.datetime.utcnow()
    
    # Query all active surplus listings
    listings = db.query(Listing).filter(Listing.status == "Listed").all()
    
    matched_results: List[SmartMatchedListing] = []
    
    for item in listings:
        checks: List[MatchPipelineCheck] = []
        reasons: List[str] = []
        is_eligible = True
        
        # 1. Radius Filter Check
        dist_km = haversine_distance_km(
            item.latitude, item.longitude,
            receiver.latitude, receiver.longitude
        )
        radius_ok = dist_km <= item.pickup_radius_km
        checks.append(MatchPipelineCheck(
            name="1. Geofence Radius Filter",
            passed=radius_ok,
            detail=f"{dist_km} km away (Donor radius: {item.pickup_radius_km} km)" if radius_ok 
                   else f"Outside radius by {round(dist_km - item.pickup_radius_km, 1)} km ({dist_km} km > {item.pickup_radius_km} km)"
        ))
        if not radius_ok:
            is_eligible = False
            reasons.append(f"Outside donor's {item.pickup_radius_km}km pickup radius (Distance: {dist_km}km)")
            
        # 2. Feasibility Check (Travel Time vs Remaining Shelf-Life)
        remaining_seconds = (item.expiry_time - now).total_seconds()
        remaining_mins = round(remaining_seconds / 60.0, 1)
        est_travel_mins = calculate_travel_time_minutes(dist_km)
        
        time_ok = (remaining_mins > est_travel_mins) and (remaining_mins > 0)
        checks.append(MatchPipelineCheck(
            name="2. Travel Feasibility Check",
            passed=time_ok,
            detail=f"Est. travel {est_travel_mins} mins fits in remaining {remaining_mins} mins" if time_ok
                   else f"Travel time ({est_travel_mins}m) exceeds shelf life ({max(0, remaining_mins)}m)"
        ))
        if not time_ok:
            is_eligible = False
            if remaining_mins <= 0:
                reasons.append("Food item has already expired")
            else:
                reasons.append(f"Travel time (~{est_travel_mins} mins) exceeds remaining shelf life ({int(remaining_mins)} mins)")
                
        # 3. Capacity and Storage Check
        capacity_ok = item.quantity <= (receiver.capacity_meals or 150.0)
        storage_ok = True
        if item.storage_type in ["chilled", "frozen"] and not receiver.has_cold_storage:
            storage_ok = False
            
        cap_storage_ok = capacity_ok and storage_ok
        checks.append(MatchPipelineCheck(
            name="3. Vehicle Capacity & Storage Fit",
            passed=cap_storage_ok,
            detail=f"Fits capacity ({item.quantity} / {receiver.capacity_meals} {item.unit}) & storage ({item.storage_type})" if cap_storage_ok
                   else (f"Exceeds capacity ({item.quantity} > {receiver.capacity_meals})" if not capacity_ok else "Cold storage required but not available")
        ))
        if not capacity_ok:
            is_eligible = False
            reasons.append(f"Quantity ({item.quantity} {item.unit}) exceeds vehicle capacity ({receiver.capacity_meals} meals)")
        if not storage_ok:
            is_eligible = False
            reasons.append(f"Requires '{item.storage_type}' storage (your profile lacks cold storage)")
            
        # 4. Rank Scoring
        # Distance factor (closer is higher): 0 to 1
        dist_factor = max(0.0, 1.0 - (dist_km / max(1.0, item.pickup_radius_km)))
        
        # Urgency factor (closer to expiry within 24h gets higher priority to prevent wastage):
        urgency_factor = max(0.0, min(1.0, 1.0 - (max(0.0, remaining_mins) / (24.0 * 60.0))))
        
        # Quantity capacity match:
        cap_factor = min(1.0, item.quantity / max(1.0, receiver.capacity_meals or 150.0))
        
        raw_score = (0.40 * dist_factor + 0.35 * urgency_factor + 0.25 * cap_factor) * 100.0
        match_score = round(raw_score if is_eligible else raw_score * 0.3, 1)
        
        checks.append(MatchPipelineCheck(
            name="4. Smart Priority Ranking",
            passed=is_eligible,
            detail=f"Composite Rank Score: {match_score}% (Proximity: {int(dist_factor*100)}%, Urgency: {int(urgency_factor*100)}%, Fit: {int(cap_factor*100)}%)"
        ))
        
        # Build listing response
        donor_user = item.donor
        listing_resp = ListingResponse(
            id=item.id,
            donor_id=item.donor_id,
            donor_name=donor_user.org_name if donor_user else "Local Donor",
            donor_phone=donor_user.phone if donor_user else None,
            donor_address=donor_user.address if donor_user else item.pickup_address,
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
            claimed_by_name=item.claimed_by.org_name if item.claimed_by else None,
            claimed_at=item.claimed_at,
            collected_at=item.collected_at,
            verified_at=item.verified_at,
            notes=item.notes,
            openfoodfacts_code=item.openfoodfacts_code,
        )
        
        matched_results.append(SmartMatchedListing(
            listing=listing_resp,
            distance_km=dist_km,
            estimated_travel_minutes=est_travel_mins,
            remaining_shelf_life_minutes=max(0.0, remaining_mins),
            is_eligible=is_eligible,
            rejection_reasons=reasons,
            checks=checks,
            match_score=match_score
        ))
        
    # Sort: Eligible first, then descending by match_score
    matched_results.sort(key=lambda x: (1 if x.is_eligible else 0, x.match_score), reverse=True)
    
    if not include_ineligible:
        return [m for m in matched_results if m.is_eligible]
        
    return matched_results
