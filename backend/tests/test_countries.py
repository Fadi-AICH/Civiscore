import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.crud.crud_country import create_country, get_country_by_name
from app.models.country import Country
from app.models.service import Service
from app.core.security import create_access_token


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db_session(client):
    # This assumes you have a get_db dependency in your app
    # that can be overridden for testing
    from app.database import get_db, engine, Base
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for testing
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user_token():
    # Create a token for testing
    return {"Authorization": f"Bearer {create_access_token(subject='test@example.com')}"}


@pytest.fixture
def test_country(db_session: Session):
    # Create a test country
    country = Country(name="Test Country", region="Test Region")
    db_session.add(country)
    db_session.commit()
    db_session.refresh(country)
    return country


@pytest.fixture
def test_country_with_service(db_session: Session, test_country: Country):
    # Create a test service linked to the test country
    service = Service(
        name="Test Service",
        category="Test Category",
        country_id=test_country.id,
        rating=4.5
    )
    db_session.add(service)
    db_session.commit()
    db_session.refresh(service)
    return test_country, service


def test_read_countries(client, test_country, test_user_token):
    response = client.get("/api/v1/countries/", headers=test_user_token)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1
    assert any(country["name"] == "Test Country" for country in data["items"])


def test_read_countries_pagination(client, test_country, test_user_token):
    # Test pagination
    response = client.get("/api/v1/countries/?page=1&limit=10", headers=test_user_token)
    assert response.status_code == 200
    data = response.json()
    assert data["page"] == 1
    assert data["limit"] == 10


def test_read_countries_filter_by_region(client, test_country, test_user_token):
    # Test filtering by region
    response = client.get(
        f"/api/v1/countries/?region={test_country.region}", 
        headers=test_user_token
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert all(country["region"] == test_country.region for country in data["items"])


def test_read_countries_sort(client, test_country, test_user_token):
    # Create another country to test sorting
    create_country(db_session=next(app.dependency_overrides[get_db]()), 
                  country_in={"name": "Aardvark Country", "region": "Test Region"})
    
    # Test sorting by name ascending
    response = client.get(
        "/api/v1/countries/?sort_by=name&sort_order=asc", 
        headers=test_user_token
    )
    assert response.status_code == 200
    data = response.json()
    names = [country["name"] for country in data["items"]]
    assert "Aardvark Country" in names
    assert names.index("Aardvark Country") < names.index("Test Country")
    
    # Test sorting by name descending
    response = client.get(
        "/api/v1/countries/?sort_by=name&sort_order=desc", 
        headers=test_user_token
    )
    assert response.status_code == 200
    data = response.json()
    names = [country["name"] for country in data["items"]]
    assert names.index("Test Country") < names.index("Aardvark Country")


def test_read_country(client, test_country, test_user_token):
    response = client.get(
        f"/api/v1/countries/{test_country.id}", 
        headers=test_user_token
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_country.id
    assert data["name"] == test_country.name
    assert data["region"] == test_country.region


def test_read_country_not_found(client, test_user_token):
    response = client.get("/api/v1/countries/9999", headers=test_user_token)
    assert response.status_code == 404
    assert response.json()["detail"] == "Country not found"


def test_create_country(client, test_user_token):
    country_data = {"name": "New Country", "region": "New Region"}
    response = client.post(
        "/api/v1/countries/", 
        json=country_data, 
        headers=test_user_token
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == country_data["name"]
    assert data["region"] == country_data["region"]
    assert "id" in data


def test_create_country_duplicate_name(client, test_country, test_user_token):
    country_data = {"name": test_country.name, "region": "Another Region"}
    response = client.post(
        "/api/v1/countries/", 
        json=country_data, 
        headers=test_user_token
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_update_country(client, test_country, test_user_token):
    update_data = {"name": "Updated Country Name"}
    response = client.put(
        f"/api/v1/countries/{test_country.id}", 
        json=update_data, 
        headers=test_user_token
    )
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["region"] == test_country.region  # Region should remain unchanged


def test_update_country_duplicate_name(client, test_country, test_user_token):
    # Create another country first
    other_country = create_country(
        db_session=next(app.dependency_overrides[get_db]()), 
        country_in={"name": "Other Country", "region": "Test Region"}
    )
    
    # Try to update test_country with the name of other_country
    update_data = {"name": "Other Country"}
    response = client.put(
        f"/api/v1/countries/{test_country.id}", 
        json=update_data, 
        headers=test_user_token
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_update_country_not_found(client, test_user_token):
    update_data = {"name": "This Will Fail"}
    response = client.put(
        "/api/v1/countries/9999", 
        json=update_data, 
        headers=test_user_token
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Country not found"


def test_delete_country(client, test_country, test_user_token):
    response = client.delete(
        f"/api/v1/countries/{test_country.id}", 
        headers=test_user_token
    )
    assert response.status_code == 204
    
    # Verify it's actually deleted
    response = client.get(
        f"/api/v1/countries/{test_country.id}", 
        headers=test_user_token
    )
    assert response.status_code == 404


def test_delete_country_with_services(client, test_country_with_service, test_user_token):
    country, _ = test_country_with_service
    response = client.delete(
        f"/api/v1/countries/{country.id}", 
        headers=test_user_token
    )
    assert response.status_code == 400
    assert "Cannot delete" in response.json()["detail"]
    assert "services" in response.json()["detail"]


def test_delete_country_not_found(client, test_user_token):
    response = client.delete("/api/v1/countries/9999", headers=test_user_token)
    assert response.status_code == 404
    assert response.json()["detail"] == "Country not found"


def test_unauthorized_access(client):
    # Test accessing endpoints without authentication
    endpoints = [
        ("GET", "/api/v1/countries/"),
        ("GET", "/api/v1/countries/1"),
        ("POST", "/api/v1/countries/"),
        ("PUT", "/api/v1/countries/1"),
        ("DELETE", "/api/v1/countries/1"),
    ]
    
    for method, endpoint in endpoints:
        if method == "GET":
            response = client.get(endpoint)
        elif method == "POST":
            response = client.post(endpoint, json={"name": "Test", "region": "Test"})
        elif method == "PUT":
            response = client.put(endpoint, json={"name": "Test"})
        elif method == "DELETE":
            response = client.delete(endpoint)
            
        assert response.status_code == 401, f"{method} {endpoint} should require authentication"
