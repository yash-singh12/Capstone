"""PlaceLocal.AI FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import initialize_database
from .routers import applications, auth, jobs, students


initialize_database()

app = FastAPI(
    title="PlaceLocal.AI API",
    version="1.0.0",
    description="Local SQLite-backed REST API for PlaceLocal.AI",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(students.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
