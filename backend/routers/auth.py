"""Authentication routes."""

import os
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import APIRouter, HTTPException, status
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr, Field

from ..database import database_connection


router = APIRouter(prefix="/api/auth", tags=["auth"])
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.getenv("PLACELOCAL_JWT_SECRET", "placelocal-local-development-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "student"
    branch: str | None = None
    roll: str | None = None
    cgpa: float | None = Field(default=None, ge=0, le=10)
    home: str | None = None
    commute: str | None = None
    skills: list[str] = Field(default_factory=list)
    latitude: float | None = None
    longitude: float | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_context.verify(password, password_hash)


def create_access_token(user_id: str, role: str) -> str:
    expires = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"sub": user_id, "role": role, "exp": expires}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest) -> AuthResponse:
    user_id = str(uuid.uuid4())

    with database_connection() as connection:
        existing = connection.execute(
            "SELECT id FROM users WHERE email = ?",
            (payload.email.strip().lower(),),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="An account with this email already exists")

        connection.execute(
            "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
            (
                user_id,
                payload.email.strip().lower(),
                hash_password(payload.password),
                payload.role,
            ),
        )

        employability_score = round(
            min(float(payload.cgpa or 0) / 10, 1) * 40
            + min(len(payload.skills) / 8, 1) * 50
            + (10 if payload.commute and any(
                marker in payload.commute.lower()
                for marker in ("hostel", "walking", "4.", "3.", "2.", "1.")
            ) else 6),
            2,
        )

        if payload.role == "student":
            connection.execute(
                """
                INSERT INTO students
                    (user_id, name, branch, roll_no, cgpa, home_address,
                     latitude, longitude, commute_mode, employability_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    user_id,
                    payload.name,
                    payload.branch,
                    payload.roll,
                    payload.cgpa,
                    payload.home,
                    payload.latitude,
                    payload.longitude,
                    payload.commute,
                    employability_score,
                ),
            )

            for skill_name in payload.skills:
                skill = connection.execute(
                    "SELECT id FROM skills WHERE name = ?",
                    (skill_name,),
                ).fetchone()
                if skill:
                    connection.execute(
                        "INSERT OR IGNORE INTO student_skills (student_id, skill_id) VALUES (?, ?)",
                        (user_id, skill["id"]),
                    )

        connection.commit()

    return AuthResponse(
        access_token=create_access_token(user_id, payload.role),
        user_id=user_id,
        role=payload.role,
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    with database_connection() as connection:
        user = connection.execute(
            "SELECT id, password_hash, role FROM users WHERE email = ?",
            (payload.email.strip().lower(),),
        ).fetchone()

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return AuthResponse(
        access_token=create_access_token(user["id"], user["role"]),
        user_id=user["id"],
        role=user["role"],
    )
