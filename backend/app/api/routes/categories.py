from fastapi import APIRouter
from app.api.deps import CurrentAccount
from app.models import CategoryPublic
from typing import Any

router = APIRouter(prefix="/categories", tags=["categories"])



@router.get("/", response_model=list[CategoryPublic])
def read_categories(account: CurrentAccount) -> Any:
    return account.categories