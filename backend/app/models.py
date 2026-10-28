import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False)  # 'donor', 'receiver', 'admin'
    org_name = Column(String(255), nullable=False)
    org_type = Column(String(100), default="General")
    phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Donor specific
    default_radius_km = Column(Float, default=10.0)
    
    # Receiver specific
    receiving_hours = Column(String(100), default="08:00 AM - 08:00 PM")
    capacity_meals = Column(Float, default=150.0)
    has_cold_storage = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Relationships
    donated_listings = relationship("Listing", back_populates="donor", foreign_keys="Listing.donor_id")
    claimed_listings = relationship("Listing", back_populates="claimed_by", foreign_keys="Listing.claimed_by_id")

class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), default="meals")  # 'meals' or 'kg'
    storage_type = Column(String(50), default="ambient")  # 'ambient', 'chilled', 'frozen'
    dietary_info = Column(String(100), default="Standard")
    
    expiry_time = Column(DateTime, nullable=False, index=True)
    listed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    pickup_address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    pickup_radius_km = Column(Float, default=10.0)
    
    # Status: 'Listed' -> 'Accepted' -> 'Collected' -> 'Verified' (or 'Expired', 'Cancelled')
    status = Column(String(50), default="Listed", index=True)
    
    # Live Tracking Status: 'Ready for Pickup' -> 'Driver Dispatched' -> 'In Transit' -> 'Delivered'
    tracking_stage = Column(String(50), default="Ready for Pickup")
    
    claimed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    claimed_at = Column(DateTime, nullable=True)
    collected_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    notes = Column(Text, nullable=True)
    openfoodfacts_code = Column(String(100), nullable=True)
    
    # Relationships
    donor = relationship("User", back_populates="donated_listings", foreign_keys=[donor_id])
    claimed_by = relationship("User", back_populates="claimed_listings", foreign_keys=[claimed_by_id])
    messages = relationship("Message", back_populates="listing")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    sender_id = Column(Integer, nullable=False)
    recipient_id = Column(Integer, nullable=False)
    sender_name = Column(String(255), nullable=False)
    recipient_name = Column(String(255), nullable=False)
    message_text = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)
    
    listing = relationship("Listing", back_populates="messages")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, nullable=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_role = Column(String(50), nullable=False)
    user_name = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)  # 'CREATED', 'ACCEPTED', 'COLLECTED', 'VERIFIED', 'EXPIRED', 'DELIVERED_NOTIFICATION'
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
