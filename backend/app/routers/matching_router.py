from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import SmartMatchedListing
from app.auth import get_current_user, require_receiver
from app.matching import run_smart_matching_pipeline

router = APIRouter(prefix="/api/matching", tags=["Smart Matching Engine"])

@router.get("/recommendations", response_model=List[SmartMatchedListing])
def get_recommendations(
    include_ineligible: bool = Query(True, description="Whether to include listings that fail radius/feasibility checks"),
    category: Optional[str] = None,
    storage_type: Optional[str] = None,
    current_user: User = Depends(require_receiver),
    db: Session = Depends(get_db)
):
    """
    Executes the 4-Stage Smart Matching Pipeline for the authenticated receiver:
    1. Geofence radius check (ST_DWithin)
    2. Travel feasibility check vs food remaining shelf-life
    3. Vehicle capacity & cold storage fit
    4. Composite ranking score & notification triage
    """
    matched = run_smart_matching_pipeline(db, current_user, include_ineligible=include_ineligible)
    
    if category:
        matched = [m for m in matched if m.listing.category == category]
    if storage_type:
        matched = [m for m in matched if m.listing.storage_type == storage_type]
        
    return matched
