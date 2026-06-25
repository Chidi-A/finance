import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.account import get_category_id


def test_read_budgets(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/budgets/", headers=account_user_token_headers
    )
    assert r.status_code == 200
    budgets = r.json()
    assert len(budgets) >= 1
    assert budgets[0]["theme"] == "#277C78"


def test_create_budget(
    client: TestClient,
    db: Session,
    account_user_with_data: tuple[dict[str, str], object],
) -> None:
    headers, account = account_user_with_data
    category_id = get_category_id(db, account, "Utilities")
    data = {
        "category_id": category_id,
        "maximum": "150.00",
        "theme": "#BE6C25",
    }
    r = client.post(
        f"{settings.API_V1_STR}/budgets/", headers=headers, json=data
    )
    assert r.status_code == 201
    created = r.json()
    assert created["maximum"] == "150.00"
    assert created["theme"] == "#BE6C25"


def test_update_budget(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/budgets/", headers=account_user_token_headers
    )
    budget_id = r.json()[0]["id"]
    r = client.patch(
        f"{settings.API_V1_STR}/budgets/{budget_id}",
        headers=account_user_token_headers,
        json={"maximum": "250.00"},
    )
    assert r.status_code == 200
    assert r.json()["maximum"] == "250.00"


def test_delete_budget(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    budgets = client.get(
        f"{settings.API_V1_STR}/budgets/", headers=account_user_token_headers
    ).json()
    budget_id = budgets[0]["id"]
    r = client.delete(
        f"{settings.API_V1_STR}/budgets/{budget_id}",
        headers=account_user_token_headers,
    )
    assert r.status_code == 200
    assert r.json()["message"] == "Budget deleted successfully"


def test_delete_budget_not_found(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/budgets/{uuid.uuid4()}",
        headers=account_user_token_headers,
    )
    assert r.status_code == 404


def test_update_budget_not_found(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.patch(
        f"{settings.API_V1_STR}/budgets/{uuid.uuid4()}",
        headers=account_user_token_headers,
        json={"maximum": "100.00"},
    )
    assert r.status_code == 404
