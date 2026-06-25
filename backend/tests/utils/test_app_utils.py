from unittest.mock import MagicMock, patch

import pytest

from app.utils import (
    EmailData,
    generate_new_account_email,
    generate_password_reset_token,
    generate_reset_password_email,
    generate_test_email,
    render_email_template,
    send_email,
    verify_password_reset_token,
)


def test_render_email_template() -> None:
    html = render_email_template(
        template_name="test_email.html",
        context={"project_name": "Finance", "email": "test@example.com"},
    )
    assert "Finance" in html
    assert "test@example.com" in html


def test_generate_test_email() -> None:
    email = generate_test_email("test@example.com")
    assert isinstance(email, EmailData)
    assert "Test email" in email.subject
    assert "test@example.com" in email.html_content


def test_generate_reset_password_email() -> None:
    email = generate_reset_password_email(
        email_to="test@example.com", email="user@example.com", token="abc123"
    )
    assert "Password recovery" in email.subject
    assert "reset-password?token=abc123" in email.html_content


def test_generate_new_account_email() -> None:
    email = generate_new_account_email(
        email_to="test@example.com", username="user@example.com", password="secret"
    )
    assert "New account" in email.subject
    assert "secret" in email.html_content


def test_generate_and_verify_password_reset_token() -> None:
    token = generate_password_reset_token("user@example.com")
    email = verify_password_reset_token(token)
    assert email == "user@example.com"


def test_verify_password_reset_token_invalid() -> None:
    assert verify_password_reset_token("not-a-valid-token") is None


@patch("app.utils.emails.Message")
@patch("app.utils.settings")
def test_send_email(mock_settings: MagicMock, mock_message_cls: MagicMock) -> None:
    mock_settings.emails_enabled = True
    mock_settings.SMTP_HOST = "smtp.example.com"
    mock_settings.SMTP_PORT = 587
    mock_settings.SMTP_TLS = True
    mock_settings.SMTP_SSL = False
    mock_settings.SMTP_USER = "user"
    mock_settings.SMTP_PASSWORD = "pass"
    mock_settings.EMAILS_FROM_NAME = "Finance"
    mock_settings.EMAILS_FROM_EMAIL = "noreply@example.com"

    mock_message = MagicMock()
    mock_message.send.return_value = "ok"
    mock_message_cls.return_value = mock_message

    send_email(
        email_to="test@example.com",
        subject="Hello",
        html_content="<p>Hi</p>",
    )

    mock_message.send.assert_called_once()


@patch("app.utils.settings")
def test_send_email_requires_configuration(mock_settings: MagicMock) -> None:
    mock_settings.emails_enabled = False
    with pytest.raises(AssertionError):
        send_email(email_to="test@example.com")
