from fastapi import APIRouter

# Import the router from the endpoints module
from app.api.v1.endpoints.users import router as users_router

# Re-export the router
router = users_router
