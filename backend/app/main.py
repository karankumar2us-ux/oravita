"""
Oravita Main Application Entrypoint
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router

app = FastAPI(
    title="Oravita API",
    description="AI Nutrition, Cycle Syncing & Metabolism Engine",
    version="1.0.0"
)

# Enable CORS for React Native & Web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {
        "app": "Oravita",
        "status": "online",
        "version": "1.0.0"
    }
