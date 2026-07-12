"""Backward-compatible model imports; definitions live in backend_shared."""

from backend_shared.database import Base
from backend_shared.models import PromoCode, Transaction, User, UserGift

__all__ = ["Base", "PromoCode", "Transaction", "User", "UserGift"]

