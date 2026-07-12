"""Transactional balance operations shared by HTTP and bot entry points."""

from typing import Optional

from sqlalchemy.orm import Session

from backend_shared.models import Transaction, User


class InsufficientBalanceError(ValueError):
    """Raised when an operation would make a TON balance negative."""


def get_or_create_user(session: Session, user_id: int) -> User:
    user = session.query(User).filter(User.user_id == user_id).first()
    if user is None:
        user = User(user_id=user_id, balance_ton=0.0, balance_stars=0)
        session.add(user)
        session.flush()
    return user


def credit_balance(session: Session, user: User, amount: float, currency: str) -> None:
    """Add a positive amount to a user's balance without committing."""
    if amount <= 0:
        raise ValueError("Amount must be greater than zero")
    if currency == "TON":
        user.balance_ton += amount
    elif currency == "STARS":
        user.balance_stars += int(amount)
    else:
        raise ValueError("Unsupported currency")


def debit_ton(user: User, amount: float) -> None:
    """Deduct a positive TON amount while preventing a negative balance."""
    if amount <= 0:
        raise ValueError("Amount must be greater than zero")
    if user.balance_ton < amount:
        raise InsufficientBalanceError("Insufficient balance")
    user.balance_ton -= amount


def create_transaction(
    session: Session,
    *,
    user_id: int,
    transaction_type: str,
    amount: float,
    currency: str = "TON",
    gift_id: Optional[str] = None,
    status: str = "completed",
    tx_hash: Optional[str] = None,
) -> Transaction:
    transaction = Transaction(
        user_id=user_id,
        transaction_type=transaction_type,
        amount=amount,
        currency=currency,
        gift_id=gift_id,
        status=status,
        tx_hash=tx_hash,
    )
    session.add(transaction)
    return transaction
