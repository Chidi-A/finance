from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, delete

from app.core.config import settings
from app.core.db import engine, init_db
from app.main import app
from app.models import User
from app.models import Account
from tests.utils.account import authentication_token_with_account
from tests.utils.user import authentication_token_from_email


@pytest.fixture(scope="session", autouse=True)
def db() -> Generator[Session, None, None]:
    with Session(engine) as session:
        init_db(session)
        yield session
        statement = delete(User)
        session.execute(statement)
        session.commit()


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as c:
        yield c





@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: Session) -> dict[str, str]:
    return authentication_token_from_email(
        client=client, email=settings.EMAIL_TEST_USER, db=db
    )


@pytest.fixture(scope="module")
def account_user_token_headers(
    client: TestClient, db: Session
) -> dict[str, str]:
    headers, _, _ = authentication_token_with_account(client=client, db=db)
    return headers


@pytest.fixture(scope="module")
def account_user_with_data(
    client: TestClient, db: Session
) -> tuple[dict[str, str], Account]:
    headers, _, account = authentication_token_with_account(client=client, db=db)
    return headers, account
