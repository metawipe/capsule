"""Backward-compatible database imports; configuration lives in backend_shared."""

from backend_shared.database import (
    Base,
    SQLALCHEMY_DATABASE_URL,
    SessionLocal,
    engine,
    get_db,
    get_session,
    init_db,
)

__all__ = [
    "Base",
    "SQLALCHEMY_DATABASE_URL",
    "SessionLocal",
    "engine",
    "get_db",
    "get_session",
    "init_db",
]

