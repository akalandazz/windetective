from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from routers.report_router import router as report_router
from routers.user_router import router as user_router
from settings import settings
from database import engine
from models import Base
import logging

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_title, version=settings.app_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

app.include_router(report_router, prefix="/api/v1/reports", tags=["report"])
app.include_router(user_router, prefix="/api/v1/users", tags=["user"])

@app.get("/health", tags=["maintenance"])
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host=settings.app_host, port=settings.app_port)
