import uuid
from typing import Any
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models import Account, Budget, BudgetPublic, BudgetCreate, BudgetUpdate, Message

router = APIRouter(prefix="/budgets", tags=["budgets"])
