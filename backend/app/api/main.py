from fastapi import APIRouter

from app.api.routes import login, users, utils, account, transactions, budgets, pots, categories
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(account.router)
api_router.include_router(transactions.router)
api_router.include_router(budgets.router)
api_router.include_router(pots.router)
api_router.include_router(categories.router)



