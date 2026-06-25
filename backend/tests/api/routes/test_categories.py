from fastapi.testclient import TestClient

from app.core.config import settings


def test_read_categories(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/categories/", headers=account_user_token_headers
    )
    assert r.status_code == 200
    categories = r.json()
    assert len(categories) >= 2
    names = {c["name"] for c in categories}
    assert "Groceries" in names
    assert "Utilities" in names
