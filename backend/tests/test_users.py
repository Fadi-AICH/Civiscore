import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.models.user import User, UserRole
from app.core.security import get_password_hash
from app.crud.crud_auth import create_user
from app.schemas.user import UserCreate


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
    create_user(db, admin_user)
    
    # Login and get token
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def normal_user_token_headers(client: TestClient, db: Session):
    """Create normal user and return token headers"""
    # Create normal user
    normal_user = UserCreate(
        username="normaluser",
        email="user@example.com",
        password="user123"
    )
    
    # Add user to database
    db_user = create_user(db, normal_user)
    
    # Login and get token
    login_data = {
        "username": "user@example.com",
        "password": "user123"
    }
    
    response = client.post("/api/v1/auth/login", data=login_data)
    token = response.json()["access_token"]
    
    return {"Authorization": f"Bearer {token}"}, db_user.id


def test_get_users_admin(client: TestClient, admin_token_headers):
    """Test that admin can get list of users"""
    response = client.get("/api/v1/users/", headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data
    
    # Check that we have at least 2 users (admin + normal user from fixtures)
    assert data["total"] >= 2


def test_get_users_normal_user(client: TestClient, normal_user_token_headers):
    """Test that normal user cannot get list of users"""
    token_headers, _ = normal_user_token_headers
    response = client.get("/api/v1/users/", headers=token_headers)
    assert response.status_code == 403


def test_get_user_by_id_admin(client: TestClient, admin_token_headers, normal_user_token_headers):
    """Test that admin can get any user by ID"""
    _, user_id = normal_user_token_headers
    
    response = client.get(f"/api/v1/users/{user_id}", headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["username"] == "normaluser"
    assert data["email"] == "user@example.com"
    assert data["role"] == "user"


def test_get_user_by_id_normal_user_self(client: TestClient, normal_user_token_headers):
    """Test that normal user can get their own user by ID"""
    token_headers, user_id = normal_user_token_headers
    
    response = client.get(f"/api/v1/users/{user_id}", headers=token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["username"] == "normaluser"
    assert data["email"] == "user@example.com"


def test_get_user_by_id_normal_user_other(client: TestClient, normal_user_token_headers, admin_token_headers):
    """Test that normal user cannot get another user by ID"""
    token_headers, _ = normal_user_token_headers
    
    # Try to get admin user (ID 1)
    response = client.get("/api/v1/users/1", headers=token_headers)
    assert response.status_code == 403


def test_update_user_admin(client: TestClient, admin_token_headers, normal_user_token_headers):
    """Test that admin can update any user"""
    _, user_id = normal_user_token_headers
    
    # Update user data
    update_data = {
        "username": "updateduser",
        "email": "updated@example.com"
    }
    
    response = client.put(f"/api/v1/users/{user_id}", headers=admin_token_headers, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "updateduser"
    assert data["email"] == "updated@example.com"


def test_update_user_normal_user_self(client: TestClient, normal_user_token_headers):
    """Test that normal user can update their own user"""
    token_headers, user_id = normal_user_token_headers
    
    # Update user data
    update_data = {
        "username": "selfupdated",
        "email": "selfupdated@example.com"
    }
    
    response = client.put(f"/api/v1/users/{user_id}", headers=token_headers, json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "selfupdated"
    assert data["email"] == "selfupdated@example.com"


def test_update_user_normal_user_role(client: TestClient, normal_user_token_headers):
    """Test that normal user cannot update their role"""
    token_headers, user_id = normal_user_token_headers
    
    # Try to update role to admin
    update_data = {
        "role": "admin"
    }
    
    response = client.put(f"/api/v1/users/{user_id}", headers=token_headers, json=update_data)
    assert response.status_code == 403


def test_update_user_normal_user_other(client: TestClient, normal_user_token_headers):
    """Test that normal user cannot update another user"""
    token_headers, _ = normal_user_token_headers
    
    # Try to update admin user (ID 1)
    update_data = {
        "username": "hacked"
    }
    
    response = client.put("/api/v1/users/1", headers=token_headers, json=update_data)
    assert response.status_code == 403


def test_delete_user_admin(client: TestClient, admin_token_headers, db: Session):
    """Test that admin can delete a user"""
    # Create a user to delete
    user_to_delete = UserCreate(
        username="todelete",
        email="delete@example.com",
        password="delete123"
    )
    
    db_user = create_user(db, user_to_delete)
    
    # Delete the user
    response = client.delete(f"/api/v1/users/{db_user.id}", headers=admin_token_headers)
    assert response.status_code == 204
    
    # Verify user is deleted
    get_response = client.get(f"/api/v1/users/{db_user.id}", headers=admin_token_headers)
    assert get_response.status_code == 404


def test_delete_user_normal_user(client: TestClient, normal_user_token_headers):
    """Test that normal user cannot delete users"""
    token_headers, _ = normal_user_token_headers
    
    # Try to delete admin user (ID 1)
    response = client.delete("/api/v1/users/1", headers=token_headers)
    assert response.status_code == 403


def test_delete_admin_self(client: TestClient, admin_token_headers):
    """Test that admin cannot delete themselves"""
    # Get admin user ID (should be 1)
    response = client.get("/api/v1/users/1", headers=admin_token_headers)
    assert response.status_code == 200
    
    # Try to delete self
    response = client.delete("/api/v1/users/1", headers=admin_token_headers)
    assert response.status_code == 400
