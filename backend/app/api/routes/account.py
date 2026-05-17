from typing import Any
from fastapi import APIRouter, HTTPException

from app.api.deps import CurrentAccount
from app.models import AccountPublic

router = APIRouter(prefix="/account", tags=["account"])

@router.get("/me", response_model=AccountPublic)
def read_account_me(account: CurrentAccount) -> Any:
    """Get the current user's account."""
    return account