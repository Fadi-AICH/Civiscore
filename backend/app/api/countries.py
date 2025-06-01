from fastapi import APIRouter

# Import the router from the endpoints module
from app.api.v1.endpoints.countries import router as countries_router

# Re-export the router
router = countries_router
