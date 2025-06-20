"""Minimal backend smoke test for CI/CD."""

from fastapi.testclient import TestClient

try:
    from app.main import app  # adjust if your FastAPI application entry point differs
except ImportError as exc:
    raise SystemExit("Cannot import FastAPI app; verify app.main exists") from exc

client = TestClient(app)


def test_root():
    """Ensure API root endpoint responds successfully."""
    response = client.get("/api/v1/ping")
    assert response.status_code == 200
