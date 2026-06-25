import uuid

from fastapi.testclient import TestClient

from app.core.config import settings


def test_read_pots(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/pots/", headers=account_user_token_headers)
    assert r.status_code == 200
    pots = r.json()
    assert len(pots) >= 1
    assert pots[0]["name"] == "Vacation"


def test_create_pot(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    data = {
        "name": "New Pot",
        "target": "300.00",
        "total": "0.00",
        "theme": "#F2CDAC",
    }
    r = client.post(
        f"{settings.API_V1_STR}/pots/", headers=account_user_token_headers, json=data
    )
    assert r.status_code == 201
    assert r.json()["name"] == "New Pot"


def test_update_pot(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    pots = client.get(
        f"{settings.API_V1_STR}/pots/", headers=account_user_token_headers
    ).json()
    pot_id = pots[0]["id"]
    r = client.patch(
        f"{settings.API_V1_STR}/pots/{pot_id}",
        headers=account_user_token_headers,
        json={"name": "Updated Pot"},
    )
    assert r.status_code == 200
    assert r.json()["name"] == "Updated Pot"


def test_delete_pot(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    create_r = client.post(
        f"{settings.API_V1_STR}/pots/",
        headers=account_user_token_headers,
        json={
            "name": "Delete Me",
            "target": "100.00",
            "total": "0.00",
            "theme": "#826CB0",
        },
    )
    pot_id = create_r.json()["id"]
    r = client.delete(
        f"{settings.API_V1_STR}/pots/{pot_id}",
        headers=account_user_token_headers,
    )
    assert r.status_code == 200
    assert r.json()["message"] == "Pot deleted successfully"


def test_add_to_pot(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    create_r = client.post(
        f"{settings.API_V1_STR}/pots/",
        headers=account_user_token_headers,
        json={
            "name": "Add Test Pot",
            "target": "500.00",
            "total": "10.00",
            "theme": "#C94736",
        },
    )
    pot_id = create_r.json()["id"]
    r = client.post(
        f"{settings.API_V1_STR}/pots/{pot_id}/add",
        headers=account_user_token_headers,
        json={"amount": "50.00"},
    )
    assert r.status_code == 200
    assert r.json()["total"] == "60.00"


def test_withdraw_from_pot(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    create_r = client.post(
        f"{settings.API_V1_STR}/pots/",
        headers=account_user_token_headers,
        json={
            "name": "Withdraw Test Pot",
            "target": "200.00",
            "total": "80.00",
            "theme": "#277C78",
        },
    )
    pot_id = create_r.json()["id"]
    r = client.post(
        f"{settings.API_V1_STR}/pots/{pot_id}/withdraw",
        headers=account_user_token_headers,
        json={"amount": "25.00"},
    )
    assert r.status_code == 200
    assert r.json()["total"] == "55.00"


def test_add_to_pot_insufficient_balance(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    pots = client.get(
        f"{settings.API_V1_STR}/pots/", headers=account_user_token_headers
    ).json()
    pot_id = pots[0]["id"]
    r = client.post(
        f"{settings.API_V1_STR}/pots/{pot_id}/add",
        headers=account_user_token_headers,
        json={"amount": "999999.00"},
    )
    assert r.status_code == 400


def test_add_to_pot_invalid_amount(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    pots = client.get(
        f"{settings.API_V1_STR}/pots/", headers=account_user_token_headers
    ).json()
    pot_id = pots[0]["id"]
    r = client.post(
        f"{settings.API_V1_STR}/pots/{pot_id}/add",
        headers=account_user_token_headers,
        json={"amount": "0"},
    )
    assert r.status_code == 400


def test_withdraw_from_pot_insufficient_balance(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    create_r = client.post(
        f"{settings.API_V1_STR}/pots/",
        headers=account_user_token_headers,
        json={
            "name": "Low Balance Pot",
            "target": "100.00",
            "total": "5.00",
            "theme": "#597EF7",
        },
    )
    pot_id = create_r.json()["id"]
    r = client.post(
        f"{settings.API_V1_STR}/pots/{pot_id}/withdraw",
        headers=account_user_token_headers,
        json={"amount": "50.00"},
    )
    assert r.status_code == 400


def test_pot_not_found(
    client: TestClient, account_user_token_headers: dict[str, str]
) -> None:
    r = client.delete(
        f"{settings.API_V1_STR}/pots/{uuid.uuid4()}",
        headers=account_user_token_headers,
    )
    assert r.status_code == 404
