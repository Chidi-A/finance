from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app import crud
from app.core.config import settings
from app.models import User, UserCreate
from tests.utils.utils import random_email, random_lower_string


def test_get_users_normal_user_me(
    client: TestClient, normal_user_token_headers: dict[str, str]
) -> None:
    r = client.get(f"{settings.API_V1_STR}/users/me", headers=normal_user_token_headers)
    current_user = r.json()
    assert current_user
    assert current_user["email"] == settings.EMAIL_TEST_USER


def test_get_existing_user_current_user(client: TestClient, db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=username, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    user_id = user.id

    login_data = {
        "username": username,
        "password": password,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}

    r = client.get(
        f"{settings.API_V1_STR}/users/{user_id}",
        headers=headers,
    )
    assert 200 <= r.status_code < 300
    api_user = r.json()
    existing_user = crud.get_user_by_email(session=db, email=username)
    assert existing_user
    assert existing_user.email == api_user["email"]


def test_register_user(client: TestClient, db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    data = {"email": username, "password": password}
    r = client.post(
        f"{settings.API_V1_STR}/users/signup",
        json=data,
    )
    assert r.status_code == 200
    created_user = r.json()
    assert created_user["email"] == username

    user_query = select(User).where(User.email == username)
    user_db = db.exec(user_query).first()
    assert user_db
    assert user_db.email == username


def test_register_user_already_exists_error(client: TestClient) -> None:
    password = random_lower_string()
    data = {
        "email": settings.FIRST_SUPERUSER,
        "password": password,
    }
    r = client.post(
        f"{settings.API_V1_STR}/users/signup",
        json=data,
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "The user with this email already exists in the system"


def _user_auth_headers(client: TestClient, email: str, password: str) -> dict[str, str]:
    r = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data={"username": email, "password": password},
    )
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_update_user_me(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    user = crud.create_user(
        session=db, user_create=UserCreate(email=email, password=password)
    )
    headers = _user_auth_headers(client, email, password)
    updated_email = random_email()

    r = client.patch(
        f"{settings.API_V1_STR}/users/me",
        headers=headers,
        json={"email": updated_email},
    )
    assert r.status_code == 200
    assert r.json()["email"] == updated_email

    db.refresh(user)
    assert user.email == updated_email


def test_update_user_me_email_exists(client: TestClient, db: Session) -> None:
    existing_email = random_email()
    password = random_lower_string()
    crud.create_user(
        session=db,
        user_create=UserCreate(email=existing_email, password=password),
    )

    email = random_email()
    user_password = random_lower_string()
    crud.create_user(
        session=db, user_create=UserCreate(email=email, password=user_password)
    )
    headers = _user_auth_headers(client, email, user_password)

    r = client.patch(
        f"{settings.API_V1_STR}/users/me",
        headers=headers,
        json={"email": existing_email},
    )
    assert r.status_code == 409


def test_update_password_me(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    new_password = random_lower_string()
    crud.create_user(
        session=db, user_create=UserCreate(email=email, password=password)
    )
    headers = _user_auth_headers(client, email, password)

    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=headers,
        json={"current_password": password, "new_password": new_password},
    )
    assert r.status_code == 200
    assert r.json()["message"] == "Password updated successfully"

    assert _user_auth_headers(client, email, new_password)


def test_update_password_me_incorrect_password(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    crud.create_user(
        session=db, user_create=UserCreate(email=email, password=password)
    )
    headers = _user_auth_headers(client, email, password)

    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=headers,
        json={
            "current_password": random_lower_string(),
            "new_password": random_lower_string(),
        },
    )
    assert r.status_code == 400
    assert r.json()["detail"] == "Incorrect password"


def test_update_password_me_same_password(client: TestClient, db: Session) -> None:
    email = random_email()
    password = random_lower_string()
    crud.create_user(
        session=db, user_create=UserCreate(email=email, password=password)
    )
    headers = _user_auth_headers(client, email, password)

    r = client.patch(
        f"{settings.API_V1_STR}/users/me/password",
        headers=headers,
        json={"current_password": password, "new_password": password},
    )
    assert r.status_code == 400
    assert (
        r.json()["detail"] == "New password cannot be the same as the current one"
    )


def test_delete_user_me(client: TestClient, db: Session) -> None:
    username = random_email()
    password = random_lower_string()
    user_in = UserCreate(email=username, password=password)
    user = crud.create_user(session=db, user_create=user_in)
    user_id = user.id

    login_data = {
        "username": username,
        "password": password,
    }
    r = client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    a_token = tokens["access_token"]
    headers = {"Authorization": f"Bearer {a_token}"}

    r = client.delete(
        f"{settings.API_V1_STR}/users/me",
        headers=headers,
    )
    assert r.status_code == 200
    deleted_user = r.json()
    assert deleted_user["message"] == "User deleted successfully"
    result = db.exec(select(User).where(User.id == user_id)).first()
    assert result is None
