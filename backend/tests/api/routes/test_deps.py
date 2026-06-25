import uuid
from datetime import timedelta

from fastapi.testclient import TestClient

from app.core.config import settings
from app.core import security
from tests.utils.user import authentication_token_from_email


def test_account_not_found_for_user_without_account(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/account/me", headers=normal_user_token_headers
    )
    assert r.status_code == 404
    assert r.json()["detail"] == "Account not found"


def test_invalid_token(client: TestClient) -> None:
    r = client.get(
        f"{settings.API_V1_STR}/account/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert r.status_code == 403


def test_user_not_found_for_valid_token(client: TestClient) -> None:
    token = security.create_access_token(
        str(uuid.uuid4()), timedelta(minutes=30)
    )
    r = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 404
