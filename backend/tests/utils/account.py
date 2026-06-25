from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import Account, Category, User, UserCreate
from tests.utils.user import user_authentication_headers
from tests.utils.utils import random_email, random_lower_string

MINIMAL_SEED_DATA = {
    "balance": {"current": 1000.0, "income": 2000.0, "expenses": 500.0},
    "transactions": [
        {
            "avatar": "./assets/images/avatars/test.jpg",
            "name": "Test Merchant",
            "category": "Groceries",
            "date": "2024-08-19T14:23:11Z",
            "amount": -50.0,
            "recurring": False,
        },
        {
            "avatar": "./assets/images/avatars/bill.jpg",
            "name": "Recurring Bill",
            "category": "Utilities",
            "date": "2024-06-25T10:00:00Z",
            "amount": -100.0,
            "recurring": True,
        },
        {
            "avatar": "./assets/images/avatars/alice.jpg",
            "name": "Alice Shop",
            "category": "Groceries",
            "date": "2024-08-18T10:00:00Z",
            "amount": -30.0,
            "recurring": False,
        },
    ],
    "budgets": [
        {"category": "Groceries", "maximum": 200.0, "theme": "#277C78"},
    ],
    "pots": [
        {"name": "Vacation", "target": 500.0, "total": 100.0, "theme": "#82C9D7"},
    ],
}


def authentication_token_with_account(
    *, client: TestClient, db: Session
) -> tuple[dict[str, str], User, Account]:
    email = random_email()
    password = random_lower_string()
    user = crud.create_user(
        session=db, user_create=UserCreate(email=email, password=password)
    )
    crud.create_account_with_data(session=db, user=user, data=MINIMAL_SEED_DATA)
    account = db.exec(select(Account).where(Account.owner_id == user.id)).one()
    headers = user_authentication_headers(
        client=client, email=email, password=password
    )
    return headers, user, account


def get_category_id(db: Session, account: Account, name: str) -> str:
    category = db.exec(
        select(Category).where(
            Category.account_id == account.id, Category.name == name
        )
    ).one()
    return str(category.id)


def demo_user_token_headers(client: TestClient) -> dict[str, str]:
    return user_authentication_headers(
        client=client,
        email=settings.DEMO_USER_EMAIL,
        password=settings.DEMO_USER_PASSWORD,
    )
