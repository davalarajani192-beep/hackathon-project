import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# If running on local Windows without PostgreSQL installed, seamlessly fall back to SQLite
# If in Docker or PostgreSQL is available, connects to PostgreSQL with PostGIS extension
DATABASE_URL = settings.DATABASE_URL

# Normalize URL if needed
is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    # Test connection
    with engine.connect() as conn:
        pass
except Exception as e:
    # Fallback to local SQLite if PostgreSQL connection fails (e.g., when run outside Docker on dev machine)
    print(f"[Database] Could not connect to {DATABASE_URL}: {e}")
    print("[Database] Falling back to local SQLite database: sqlite:///./easy_rescue.db")
    DATABASE_URL = "sqlite:///./easy_rescue.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    is_sqlite = True

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # If postgres, try creating postgis extension if permitted
    if not is_sqlite:
        try:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
                print("[Database] PostGIS extension confirmed/enabled.")
        except Exception as e:
            print(f"[Database] PostGIS extension note: {e}")
            
    # Create all tables
    Base.metadata.create_all(bind=engine)
