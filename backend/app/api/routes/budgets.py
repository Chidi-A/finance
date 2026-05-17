import uuid
from typing import Any
from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep, CurrentAccount
from app.models import Budget, BudgetPublic, BudgetCreate, BudgetUpdate, Message

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("/", response_model=list[BudgetPublic])
def read_budgets(account: CurrentAccount) -> Any:
    return account.budgets


@router.post("/", response_model=BudgetPublic, status_code=201)
def create_budget(session: SessionDep, account: CurrentAccount, budget_in: BudgetCreate) -> Any:

    budget = Budget.model_validate(budget_in, update={"account_id": account.id})
    session.add(budget)
    session.commit()
    session.refresh(budget)
    return budget


@router.patch("/{budget_id}", response_model=BudgetPublic)
def update_budget(session: SessionDep, account: CurrentAccount, budget_id: uuid.UUID, budget_in: BudgetUpdate) -> Any:
    budget = session.get(Budget, budget_id)
    if not budget or budget.account_id != account.id:
        raise HTTPException(status_code=404, detail="Budget not found")
    budget.sqlmodel_update(budget_in.model_dump(exclude_unset=True))
    session.add(budget)
    session.commit()
    session.refresh(budget)
    return budget


@router.delete("/{budget_id}", response_model=Message)
def delete_budget(session: SessionDep, account: CurrentAccount, budget_id: uuid.UUID) -> Message:
    budget = session.get(Budget, budget_id)
    if not budget or budget.account_id != account.id:
        raise HTTPException(status_code=404, detail="Budget not found")
    session.delete(budget)
    session.commit()
    return Message(message="Budget deleted successfully")
