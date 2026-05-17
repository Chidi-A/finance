import uuid
from typing import Any
from fastapi import APIRouter, HTTPException, Query
from sqlmodel import col, func, select

from app.api.deps import CurrentAccount, SessionDep
from app.models import Transaction, TransactionPublic



router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("/", response_model=list[TransactionPublic])
def read_transactions(
    session: SessionDep,
    account: CurrentAccount,
    skip: int = 0,
    limit: int = 10,
    category_id: uuid.UUID | None = None,
    is_recurring: bool | None = None,
    search: str | None = Query(default=None),
    sort_by: str = "latest",   
) -> Any:
    stmt = select(Transaction).where(Transaction.account_id == account.id)

    if category_id:
        stmt = stmt.where(Transaction.category_id == category_id)
    if is_recurring is not None:
        stmt = stmt.where(Transaction.is_recurring == is_recurring)
    if search:
        stmt = stmt.where(col(Transaction.counterparty_name).ilike(f"%{search}%"))
    match sort_by:
        case "oldest":
            stmt = stmt.order_by(Transaction.posted_at.asc())
        case "a-z":
            stmt = stmt.order_by(col(Transaction.counterparty_name).asc())
        case "z-a":
            stmt = stmt.order_by(col(Transaction.counterparty_name).desc())
        case "highest":
            stmt = stmt.order_by(Transaction.amount.desc())
        case "lowest":
            stmt = stmt.order_by(Transaction.amount.asc())
        case _:  # "latest"
            stmt = stmt.order_by(Transaction.posted_at.desc())
    return session.exec(stmt.offset(skip).limit(limit)).all()


@router.get("/count")
def count_transactions(
    session: SessionDep,
    account: CurrentAccount,
    category_id: uuid.UUID | None = None,
    is_recurring: bool | None = None,
    search: str | None = Query(default=None),
) -> int:
    stmt = select(func.count()).select_from(Transaction).where(Transaction.account_id == account.id)
    if category_id:
        stmt = stmt.where(Transaction.category_id == category_id)
    if is_recurring is not None:
        stmt = stmt.where(Transaction.is_recurring == is_recurring)
    if search:
        stmt = stmt.where(col(Transaction.counterparty_name).ilike(f"%{search}%"))
    return session.exec(stmt).one()
