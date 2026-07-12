"""Database configuration and session lifecycle shared by all Python services."""

import os
from pathlib import Path
from typing import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = PROJECT_ROOT / "backend" / "db.sqlite3"
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"
)


class Base(DeclarativeBase):
    """Base class used by every persistent model."""


_engine_options = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    _engine_options["connect_args"] = {"check_same_thread": False}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **_engine_options)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Yield a request-scoped database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_session() -> Session:
    """Return a session for command-line and bot handlers to close explicitly."""
    return SessionLocal()


def init_db() -> None:
    """Create missing tables without modifying existing schema."""
    # Importing registers all models on the shared metadata before create_all.
    from backend_shared import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
