import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User, UserRole
from app.models.service import Service
from app.models.country import Country
from app.models.evaluation import Evaluation
from app.crud.crud_auth import create_user
from app.crud.crud_service import create_service
from app.crud.crud_country import create_country
from app.schemas.user import UserCreate
from app.schemas.country import CountryCreate
from app.schemas.service import ServiceCreate


@pytest.fixture
def user_token_headers(client: TestClient, db: Session):
    """Create normal user and return token headers"""
    # Create normal user
    user = UserCreate(
        username="testuser",
        email="testuser@example.com",
        password="testpass123"
    )
    
    # Add user to database
    db_user = create_user(db, user)
    
    # Login and get token
    login_data = {
        "username": "testuser@example.com",
        "password": "testpass123"
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}, db_user.id


@pytest.fixture
def admin_token_headers(client: TestClient, db: Session):
    """Create admin user and return token headers"""
    # Create admin user
    admin_user = UserCreate(
        username="admin",
        email="admin@example.com",
        password="admin123",
        role=UserRole.ADMIN
    )
    
    # Add admin to database
    db_admin = create_user(db, admin_user)
    
    # Login and get token
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}, db_admin.id


@pytest.fixture
def test_service(db: Session):
    """Create a test service for evaluations"""
    # Create a country first
    country = CountryCreate(
        name="Test Country",
        region="Test Region"
    )
    db_country = create_country(db, country)
    
    # Create a service
    service = ServiceCreate(
        name="Test Service",
        category="Test Category",
        country_id=db_country.id
    )
    db_service = create_service(db, service)
    
    return db_service


@pytest.fixture
def test_evaluation(db: Session, user_token_headers, test_service):
    """Create a test evaluation"""
    _, user_id = user_token_headers
    
    # Create evaluation directly in the database
    db_evaluation = Evaluation(
        user_id=user_id,
        service_id=test_service.id,
        score=8.5,
        comment="This is a test evaluation",
        timestamp=datetime.utcnow()
    )
    
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    
    return db_evaluation


# Test creating an evaluation
def test_create_evaluation(client: TestClient, user_token_headers, test_service):
    token_headers, _ = user_token_headers
    
    evaluation_data = {
        "score": 9.0,
        "comment": "Great service!",
        "service_id": test_service.id
    }
    
    response = client.post(
        "/api/v1/evaluations/",
        headers=token_headers,
        json=evaluation_data
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["score"] == 9.0
    assert data["comment"] == "Great service!"
    assert data["service_id"] == test_service.id


# Test creating a duplicate evaluation
def test_create_duplicate_evaluation(client: TestClient, user_token_headers, test_service, test_evaluation):
    token_headers, _ = user_token_headers
    
    evaluation_data = {
        "score": 7.0,
        "comment": "Another evaluation for the same service",
        "service_id": test_service.id
    }
    
    response = client.post(
        "/api/v1/evaluations/",
        headers=token_headers,
        json=evaluation_data
    )
    
    assert response.status_code == 400
    assert "already evaluated" in response.json()["detail"]


# Test getting evaluations with pagination
def test_get_evaluations_pagination(client: TestClient, admin_token_headers, test_evaluation):
    token_headers, _ = admin_token_headers
    
    response = client.get(
        "/api/v1/evaluations/?page=1&limit=10",
        headers=token_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert "page" in data
    assert "limit" in data
    assert data["page"] == 1
    assert data["limit"] == 10
    assert len(data["items"]) > 0


# Test getting evaluations with filtering
def test_get_evaluations_filtering(client: TestClient, admin_token_headers, test_evaluation):
    token_headers, _ = admin_token_headers
    
    response = client.get(
        f"/api/v1/evaluations/?service_id={test_evaluation.service_id}&min_score=8.0",
        headers=token_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) > 0
    for item in data["items"]:
        assert item["service_id"] == test_evaluation.service_id
        assert item["score"] >= 8.0


# Test getting evaluations for a specific service
def test_get_evaluations_by_service(client: TestClient, test_service, test_evaluation):
    response = client.get(f"/api/v1/evaluations/{test_service.id}/list")
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert data[0]["service_id"] == test_service.id


# Test getting a specific evaluation
def test_get_evaluation_by_id(client: TestClient, test_evaluation):
    response = client.get(f"/api/v1/evaluations/{test_evaluation.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_evaluation.id
    assert data["score"] == 8.5
    assert data["comment"] == "This is a test evaluation"


# Test updating an evaluation
def test_update_evaluation(client: TestClient, user_token_headers, test_evaluation):
    token_headers, _ = user_token_headers
    
    update_data = {
        "score": 7.5,
        "comment": "Updated comment"
    }
    
    response = client.put(
        f"/api/v1/evaluations/{test_evaluation.id}",
        headers=token_headers,
        json=update_data
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 7.5
    assert data["comment"] == "Updated comment"


# Test updating another user's evaluation
def test_update_other_user_evaluation(client: TestClient, admin_token_headers, test_evaluation):
    token_headers, _ = admin_token_headers
    
    update_data = {
        "score": 6.0,
        "comment": "Admin trying to update"
    }
    
    response = client.put(
        f"/api/v1/evaluations/{test_evaluation.id}",
        headers=token_headers,
        json=update_data
    )
    
    assert response.status_code == 404
    assert "not found or you don't have permission" in response.json()["detail"]


# Test deleting an evaluation by the owner
def test_delete_evaluation_owner(client: TestClient, user_token_headers, db: Session):
    token_headers, user_id = user_token_headers
    
    # Create a new evaluation to delete
    service = db.query(Service).first()
    new_evaluation = Evaluation(
        user_id=user_id,
        service_id=service.id,
        score=6.0,
        comment="Evaluation to delete",
        timestamp=datetime.utcnow()
    )
    db.add(new_evaluation)
    db.commit()
    db.refresh(new_evaluation)
    
    response = client.delete(
        f"/api/v1/evaluations/{new_evaluation.id}",
        headers=token_headers
    )
    
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = client.get(f"/api/v1/evaluations/{new_evaluation.id}")
    assert get_response.status_code == 404


# Test deleting another user's evaluation as admin
def test_delete_evaluation_admin(client: TestClient, admin_token_headers, test_evaluation):
    token_headers, _ = admin_token_headers
    
    response = client.delete(
        f"/api/v1/evaluations/{test_evaluation.id}",
        headers=token_headers
    )
    
    assert response.status_code == 204
    
    # Verify it's deleted
    get_response = client.get(f"/api/v1/evaluations/{test_evaluation.id}")
    assert get_response.status_code == 404


# Test getting user's own evaluations
def test_get_user_evaluations(client: TestClient, user_token_headers, test_evaluation):
    token_headers, _ = user_token_headers
    
    response = client.get(
        "/api/v1/evaluations/user/me",
        headers=token_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    
    # Check that all evaluations belong to the user
    for evaluation in data:
        assert "user" in evaluation
        assert evaluation["user"]["email"] == "testuser@example.com"


# Test getting evaluation statistics for a service
def test_get_service_evaluation_stats(client: TestClient, test_service, test_evaluation):
    response = client.get(f"/api/v1/evaluations/stats/service/{test_service.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert "total_count" in data
    assert "average_score" in data
    assert "score_distribution" in data
    assert data["total_count"] > 0
    assert data["average_score"] > 0


# Test getting overall evaluation statistics (admin only)
def test_get_overall_evaluation_stats(client: TestClient, admin_token_headers, test_evaluation):
    token_headers, _ = admin_token_headers
    
    response = client.get(
        "/api/v1/evaluations/stats/overall",
        headers=token_headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "total_count" in data
    assert "average_score" in data
    assert "score_distribution" in data
    assert data["total_count"] > 0


# Test that non-admin cannot access overall stats
def test_get_overall_stats_non_admin(client: TestClient, user_token_headers):
    token_headers, _ = user_token_headers
    
    response = client.get(
        "/api/v1/evaluations/stats/overall",
        headers=token_headers
    )
    
    assert response.status_code == 403
