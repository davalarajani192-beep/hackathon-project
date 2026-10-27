import math
from typing import List, Tuple
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.config import settings

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Great-circle distance between two points on Earth using Haversine formula.
    Returns distance in kilometers.
    """
    R = 6371.0  # Earth's mean radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

def calculate_travel_time_minutes(distance_km: float, speed_kmh: float = None, buffer_mins: float = None) -> float:
    """
    Estimated urban transit travel time including traffic, loading and verification buffer.
    """
    speed = speed_kmh or settings.DEFAULT_AVG_SPEED_KMH
    buffer = buffer_mins or settings.PICKUP_BUFFER_MINUTES
    transit_minutes = (distance_km / speed) * 60.0
    return round(transit_minutes + buffer, 1)

def query_listings_within_radius_postgis(
    db: Session,
    rec_lat: float,
    rec_lon: float,
    status_filter: str = "Listed"
) -> List[Tuple[int, float]]:
    """
    Executes PostGIS ST_DWithin and ST_Distance query:
    Finds listings where receiver is inside the donor's pickup radius (pickup_radius_km * 1000 meters).
    Returns list of (listing_id, distance_km).
    """
    is_sqlite = db.bind.dialect.name == "sqlite"
    
    if not is_sqlite:
        try:
            # PostGIS ST_DWithin check:
            # Note: ST_DWithin takes (geography1, geography2, distance_in_meters)
            # We match where distance between listing and receiver <= listing.pickup_radius_km * 1000
            sql = text("""
                SELECT 
                    id,
                    ST_Distance(
                        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
                        ST_SetSRID(ST_MakePoint(:rec_lon, :rec_lat), 4326)::geography
                    ) / 1000.0 AS distance_km
                FROM listings
                WHERE status = :status
                  AND ST_DWithin(
                      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
                      ST_SetSRID(ST_MakePoint(:rec_lon, :rec_lat), 4326)::geography,
                      pickup_radius_km * 1000.0
                  )
                ORDER BY distance_km ASC;
            """)
            result = db.execute(sql, {
                "rec_lon": rec_lon,
                "rec_lat": rec_lat,
                "status": status_filter
            }).fetchall()
            return [(row[0], round(row[1], 2)) for row in result]
        except Exception as e:
            print(f"[GeoUtils] PostGIS query fallback to Python haversine: {e}")
            db.rollback()

    # Fallback for SQLite or when PostGIS extension is not active:
    # Query all active listings and compute via Haversine
    listings_sql = text("SELECT id, latitude, longitude, pickup_radius_km FROM listings WHERE status = :status")
    rows = db.execute(listings_sql, {"status": status_filter}).fetchall()
    
    within_radius = []
    for row in rows:
        lid, lat, lon, radius_km = row[0], row[1], row[2], row[3]
        dist = haversine_distance_km(lat, lon, rec_lat, rec_lon)
        if dist <= radius_km:
            within_radius.append((lid, dist))
            
    within_radius.sort(key=lambda x: x[1])
    return within_radius
