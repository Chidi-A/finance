from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import Account, AccountPublic

router = APIRouter(prefix="/account", tags=["account"])

@router.get("/me", response_model=AccountPublic)
def read_account_me(session: SessionDep, current_user: CurrentUser) -> Any:
    """Get the current user's account."""
    account = session.exec(
        select(Account).where(Account.owner_id == current_user.id)
    ).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account