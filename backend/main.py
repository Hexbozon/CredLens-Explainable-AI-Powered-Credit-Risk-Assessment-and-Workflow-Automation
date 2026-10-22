import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.prediction import router as prediction_router
from routes.applications import router as applications_router

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app = FastAPI(
    title="Credit Risk Assessment API",
    description="API for assessing credit risk of loan applications.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)
app.include_router(applications_router)
app.include_router(auth_router)

@app.get("/")
def root():
    return {
        "message": "Credit Risk Assessment API is running"
    }


