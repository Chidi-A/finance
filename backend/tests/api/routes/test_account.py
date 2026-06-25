from fastapi.testclient import TestClient

from app.core.config import settings


def test_read_account_me(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/account/me", headers=account_user_token_headers
    )
    assert r.status_code == 200
    data = r.json()
    assert data["current_balance"] == "1000.00"
    assert data["income"] == "2000.00"
    assert data["expenses"] == "500.00"
