import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserRegister(BaseModel):
    email: str
    password: str
    role: str = Field(..., pattern="^(donor|receiver|admin)$")
    org_name: str
    org_type: Optional[str] = "General"
    phone: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    default_radius_km: Optional[float] = 10.0
    capacity_meals: Optional[float] = 150.0
    has_cold_storage: Optional[bool] = False

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    org_name: str
    org_type: str
    phone: Optional[str]
    address: str
    latitude: float
    longitude: float
    default_radius_km: Optional[float]
    capacity_meals: Optional[float]
    has_cold_storage: Optional[bool]
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Listing Schemas
class ListingCreate(BaseModel):
    title: str
    category: str
    quantity: float
    unit: str = "meals"
    storage_type: str = "ambient"  # ambient, chilled, frozen
    dietary_info: Optional[str] = "Standard"
    expiry_time: datetime.datetime
    pickup_address: str
    latitude: float
    longitude: float
    pickup_radius_km: float = 10.0
    notes: Optional[str] = None
    openfoodfacts_code: Optional[str] = None

class ListingResponse(BaseModel):
    id: int
    donor_id: int
    donor_name: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_address: Optional[str] = None
    title: str
    category: str
    quantity: float
    unit: str
    storage_type: str
    dietary_info: str
    expiry_time: datetime.datetime
    listed_at: datetime.datetime
    pickup_address: str
    latitude: float
    longitude: float
    pickup_radius_km: float
    status: str
    claimed_by_id: Optional[int] = None
    claimed_by_name: Optional[str] = None
    claimed_at: Optional[datetime.datetime] = None
    collected_at: Optional[datetime.datetime] = None
    verified_at: Optional[datetime.datetime] = None
    notes: Optional[str] = None
    openfoodfacts_code: Optional[str] = None

    class Config:
        from_attributes = True

# Smart Matching Schemas
class MatchPipelineCheck(BaseModel):
    passed: bool
    name: str
    detail: str

class SmartMatchedListing(BaseModel):
    listing: ListingResponse
    distance_km: float
    estimated_travel_minutes: float
    remaining_shelf_life_minutes: float
    is_eligible: bool
    rejection_reasons: List[str] = []
    checks: List[MatchPipelineCheck] = []
    match_score: float

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: int
    listing_id: Optional[int]
    user_id: Optional[int]
    user_role: str
    user_name: str
    action: str
    details: str
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# Dashboard Metrics Schemas
class MetricsSummary(BaseModel):
    total_listed_meals: float
    total_collected_meals: float
    total_verified_meals: float
    active_surplus_listings: int
    co2_saved_kg: float
    diversion_timeline: List[dict]
    category_distribution: List[dict]
    status_distribution: List[dict]
