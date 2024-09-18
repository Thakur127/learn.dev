import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

RATE_LIMIT_HIT_REQUEST = settings.REQUESTS_LIMIT + 1


@pytest.mark.parametrize(
    "num_requests, expected_status", [(RATE_LIMIT_HIT_REQUEST, 429)]
)
def test_rate_limiting(num_requests, expected_status):
    client = TestClient(app)

    for _ in range(num_requests):
        response = client.get("/api/v1/")

    assert response.status_code == expected_status
