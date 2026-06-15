import uuid
from typing import Any
from datetime import date, timezone
from fastapi import APIRouter, HTTPException, Query
from sqlmodel import col, func, select

from app.api.deps import CurrentAccount, SessionDep
from app.models import Transaction, TransactionPublic

from pydantic import BaseModel
from decimal import Decimal

class RecurringBillsSummary(BaseModel):
    total_bills: Decimal
    paid_count: int
    paid_total: Decimal
    upcoming_count: int
    upcoming_total: Decimal
    due_soon_count: int
    due_soon_total: Decimal



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


@router.get("/spending-by-category")
def spending_by_category(session: SessionDep, account: CurrentAccount) -> dict[str, str]:
    stmt = (
        select(Transaction.category_id, func.sum(Transaction.amount).label("total"))
        .where(Transaction.account_id == account.id)
        .where(Transaction.amount < 0)
        .group_by(Transaction.category_id)
    )
    rows = session.exec(stmt).all()
    return {str(row.category_id): str(abs(row.total)) for row in rows}


@router.get("/recurring-summary", response_model=RecurringBillsSummary)
def recurring_bills_summary(session: SessionDep, account: CurrentAccount) -> Any:
    stmt = (
        select(Transaction)
        .where(Transaction.account_id == account.id)
        .where(Transaction.is_recurring == True)
    )
    bills = session.exec(stmt).all()

    today = date.today()

    due_soon_window = 5
    paid, upcoming, due_soon = [], [], []

    for bill in bills:
        bill_day = bill.posted_at.astimezone(timezone.utc).day
        bill_date = today.replace(day=bill_day) if bill_day <= today.day else None

        if bill_day <= today.day:
            paid.append(bill)
        else:
            days_until = bill_day - today.day
            if days_until <= due_soon_window:
                due_soon.append(bill)
            else:
                upcoming.append(bill)
    all_amounts = [abs(b.amount) for b in bills]
    return RecurringBillsSummary(
        total_bills=sum(all_amounts, Decimal("0")),
        paid_count=len(paid),
        paid_total=sum((abs(b.amount) for b in paid), Decimal("0")),
        upcoming_count=len(upcoming) + len(due_soon),
        upcoming_total=sum((abs(b.amount) for b in upcoming + due_soon), Decimal("0")),
        due_soon_count=len(due_soon),
        due_soon_total=sum((abs(b.amount) for b in due_soon), Decimal("0")),
    )


