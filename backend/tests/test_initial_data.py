from unittest.mock import patch

from app import initial_data


@patch("app.initial_data.init")
def test_main(mock_init: object) -> None:
    initial_data.main()
    mock_init.assert_called_once()
