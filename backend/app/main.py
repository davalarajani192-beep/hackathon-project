import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.database import init_db
from app.seed_data import seed_database
from app.scheduler import check_and_expire_listings

from app.routers.auth_router import router as auth_router
from app.routers.listings_router import router as listings_router
from app.routers.matching_router import router as matching_router
from app.routers.admin_router import router as admin_router
from app.routers.openfoodfacts_router import router as food_facts_router

scheduler = AsyncIOScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed demo data
    print("[Startup] Initializing EASY database...")
    init_db()
    seed_database()
    
    # Start auto-expiry background scheduler
    print("[Startup] Starting periodic auto-expiry scheduler (runs every 60s)...")
    scheduler.add_job(check_and_expire_listings, "interval", seconds=60, id="auto_expire_job")
    scheduler.start()
    
    yield
    
    # Shutdown
    print("[Shutdown] Stopping scheduler...")
    if scheduler.running:
        scheduler.shutdown()

app = FastAPI(
    title="EASY – Food-Expiry Rescue and Local Surplus Exchange API",
    description="Role-based platform where donors list surplus food with expiry timestamps, and nearby receivers find, claim, collect, and verify it within radius and shelf life.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(listings_router)
app.include_router(matching_router)
app.include_router(admin_router)
app.include_router(food_facts_router)

@app.get("/")
def root():
    return {
        "app": "EASY – Food-Expiry Rescue and Local Surplus Exchange",
        "tagline": "Surplus today. A meal tonight.",
        "team": "Decoders",
        "members": ["Vindhya", "Vineela", "Sreenidhi", "Gowtham"],
        "docs_url": "/docs",
        "status": "active"
    }
