from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.account import get_category_id


def test_read_transactions(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/", headers=account_user_token_headers
    )
    assert r.status_code == 200
    transactions = r.json()
    assert len(transactions) >= 1
    assert transactions[0]["counterparty_name"]


def test_read_transactions_with_search(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/",
        headers=account_user_token_headers,
        params={"search": "Alice"},
    )
    assert r.status_code == 200
    transactions = r.json()
    assert len(transactions) == 1
    assert transactions[0]["counterparty_name"] == "Alice Shop"


def test_read_transactions_sort_options(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    for sort_by in ("oldest", "a-z", "z-a", "highest", "lowest"):
        r = client.get(
            f"{settings.API_V1_STR}/transactions/",
            headers=account_user_token_headers,
            params={"sort_by": sort_by},
        )
        assert r.status_code == 200
        assert isinstance(r.json(), list)


def test_read_transactions_filter_by_category(
    client: TestClient,
    db: Session,
    account_user_with_data: tuple[dict[str, str], object],
) -> None:
    headers, account = account_user_with_data
    category_id = get_category_id(db, account, "Groceries")
    r = client.get(
        f"{settings.API_V1_STR}/transactions/",
        headers=headers,
        params={"category_id": category_id},
    )
    assert r.status_code == 200
    assert len(r.json()) == 2


def test_count_transactions(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/count",
        headers=account_user_token_headers,
    )
    assert r.status_code == 200
    assert r.json() == 3


def test_count_transactions_with_recurring_filter(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/count",
        headers=account_user_token_headers,
        params={"is_recurring": True},
    )
    assert r.status_code == 200
    assert r.json() == 1


def test_spending_by_category(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/spending-by-category",
        headers=account_user_token_headers,
    )
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
    assert len(data) >= 1


def test_read_transactions_filter_by_recurring(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/",
        headers=account_user_token_headers,
        params={"is_recurring": False},
    )
    assert r.status_code == 200
    assert all(not tx["is_recurring"] for tx in r.json())


def test_count_transactions_with_search(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/count",
        headers=account_user_token_headers,
        params={"search": "Merchant"},
    )
    assert r.status_code == 200
    assert r.json() == 1


def test_recurring_bills_summary(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/transactions/recurring-summary",
        headers=account_user_token_headers,
    )
    assert r.status_code == 200
    summary = r.json()
    assert "total_bills" in summary
    assert summary["paid_count"] >= 0
    assert summary["upcoming_count"] >= 0
