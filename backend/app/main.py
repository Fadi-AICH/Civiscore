# Import compatibility module first to patch Pydantic for Python 3.13+
from app.core.compat import patch_pydantic_parameter

from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
# Importer les routes depuis le bon emplacement
from app.api import auth, countries, services, evaluations

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api_router = APIRouter()

# Add test route
@api_router.get("/ping")
async def ping():
    return {"message": "pong"}

# Include routers from endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(countries.router, prefix="/countries", tags=["countries"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(evaluations.router, prefix="/evaluations", tags=["evaluations"])

# Add global prefix
app.include_router(api_router, prefix=settings.API_V1_STR)

# Run the app if executed directly
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
