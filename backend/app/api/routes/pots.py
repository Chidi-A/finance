import uuid
from decimal import Decimal
from typing import Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.api.deps import SessionDep, CurrentAccount
from app.models import Pot, PotPublic, PotCreate, PotUpdate, Message

router = APIRouter(prefix="/pots", tags=["pots"])

class PotTransfer(BaseModel):
    amount: Decimal


@router.get("/", response_model=list[PotPublic])
def read_pots(account: CurrentAccount) -> Any:
    return account.pots


@router.post("/", response_model=PotPublic, status_code=201)
def create_pot(session: SessionDep, account: CurrentAccount, pot_in: PotCreate) -> Any:
    pot = Pot.model_validate(pot_in, update={"account_id": account.id})
    session.add(pot)
    session.commit()
    session.refresh(pot)
    return pot


@router.patch("/{pot_id}", response_model=PotPublic)
def update_pot(session: SessionDep, account: CurrentAccount, pot_id: uuid.UUID, pot_in: PotUpdate) -> Any:
    pot = session.get(Pot, pot_id)
    if not pot or pot.account_id != account.id:
        raise HTTPException(status_code=404, detail="Pot not found")
    pot.sqlmodel_update(pot_in.model_dump(exclude_unset=True))
    session.add(pot)
    session.commit()
    session.refresh(pot)
    return pot


@router.delete("/{pot_id}", response_model=Message)
def delete_pot(session: SessionDep, account: CurrentAccount, pot_id: uuid.UUID) -> Message:
    pot = session.get(Pot, pot_id)
    if not pot or pot.account_id != account.id:
        raise HTTPException(status_code=404, detail="Pot not found")
    session.delete(pot)
    session.commit()
    return Message(message="Pot deleted successfully")


@router.post("/{pot_id}/add", response_model=PotPublic)
def add_to_pot(session: SessionDep, account: CurrentAccount, pot_id: uuid.UUID, transfer: PotTransfer) -> Any:
    pot = session.get(Pot, pot_id)
    if not pot or pot.account_id != account.id:
        raise HTTPException(status_code=404, detail="Pot not found")
    if transfer.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if account.current_balance < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    account.current_balance -= transfer.amount
    pot.total += transfer.amount
    session.add(account)
    session.add(pot)
    session.commit()
    session.refresh(pot)
    return pot


@router.post("/{pot_id}/withdraw", response_model=PotPublic)
def withdraw_from_pot(session: SessionDep, account: CurrentAccount, pot_id: uuid.UUID, transfer: PotTransfer) -> Any:
    pot = session.get(Pot, pot_id)
    if not pot or pot.account_id != account.id:
        raise HTTPException(status_code=404, detail="Pot not found")
    if transfer.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive")
    if pot.total < transfer.amount:
        raise HTTPException(status_code=400, detail="Insufficient pot balance")
    pot.total -= transfer.amount
    account.current_balance += transfer.amount
    session.add(account)
    session.add(pot)
    session.commit()
    session.refresh(pot)
    return pot