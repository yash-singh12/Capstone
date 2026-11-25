"""Job application routes."""

import uuid
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ..database import database_connection


router = APIRouter(prefix="/api/applications", tags=["applications"])


class ApplicationRequest(BaseModel):
    student_id: str = Field(min_length=1)
    job_id: str = Field(min_length=1)
    readiness_score: float | None = Field(default=None, ge=0, le=100)
    mock_score: int | None = Field(default=None, ge=0)
    mock_total: int | None = Field(default=None, ge=1)


class StatusRequest(BaseModel):
    status: Literal["under_review", "interview_scheduled", "selected", "rejected"]
    employer_id: str = Field(min_length=1)


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_application(payload: ApplicationRequest) -> dict:
    if (payload.mock_score is None) != (payload.mock_total is None):
        raise HTTPException(status_code=422, detail="Mock score and total must be provided together")
    if payload.mock_score is not None and payload.mock_score > payload.mock_total:
        raise HTTPException(status_code=422, detail="Mock score cannot exceed the total")

    application_id = str(uuid.uuid4())
    applied_at = datetime.now(timezone.utc).isoformat()

    with database_connection() as connection:
        student = connection.execute(
            "SELECT user_id FROM students WHERE user_id = ?",
            (payload.student_id,),
        ).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        job = connection.execute(
            "SELECT id FROM jobs WHERE id = ?",
            (payload.job_id,),
        ).fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        existing = connection.execute(
            """
            SELECT id FROM applications
            WHERE student_id = ? AND job_id = ?
            """,
            (payload.student_id, payload.job_id),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Application already exists")

        connection.execute(
            """
            INSERT INTO applications
                (id, student_id, job_id, status, readiness_score, applied_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                application_id,
                payload.student_id,
                payload.job_id,
                "pending",
                payload.readiness_score,
                applied_at,
            ),
        )
        if payload.mock_score is not None:
            connection.execute(
                """
                INSERT INTO mock_attempts (id, student_id, job_id, score, total, completed_at)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    str(uuid.uuid4()),
                    payload.student_id,
                    payload.job_id,
                    payload.mock_score,
                    payload.mock_total,
                    applied_at,
                ),
            )
        connection.commit()

    return {
        "id": application_id,
        "student_id": payload.student_id,
        "job_id": payload.job_id,
        "status": "pending",
        "readiness_score": payload.readiness_score,
        "applied_at": applied_at,
    }


@router.get("/student/{student_id}")
def list_student_applications(student_id: str) -> list[dict]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT a.id, a.student_id, a.job_id, a.status,
                   a.readiness_score, a.applied_at,
                   j.title, j.company, j.tag, j.address, j.salary,
                   (SELECT m.score FROM mock_attempts m
                    WHERE m.student_id = a.student_id AND m.job_id = a.job_id
                    ORDER BY m.completed_at DESC LIMIT 1) AS mock_score,
                   (SELECT m.total FROM mock_attempts m
                    WHERE m.student_id = a.student_id AND m.job_id = a.job_id
                    ORDER BY m.completed_at DESC LIMIT 1) AS mock_total
            FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.student_id = ?
            ORDER BY a.applied_at DESC
            """,
            (student_id,),
        ).fetchall()

    return [dict(row) for row in rows]


@router.patch("/{application_id}/status")
def update_application_status(application_id: str, payload: StatusRequest) -> dict:
    with database_connection() as connection:
        application = connection.execute(
            """
            SELECT a.id, a.status, j.employer_id
            FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.id = ?
            """,
            (application_id,),
        ).fetchone()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        employer = connection.execute(
            "SELECT role FROM users WHERE id = ?",
            (payload.employer_id,),
        ).fetchone()
        if not employer or employer["role"] != "employer":
            raise HTTPException(status_code=403, detail="Employer access required")
        if application["employer_id"] != payload.employer_id:
            raise HTTPException(status_code=403, detail="This application does not belong to your job posting")

        connection.execute(
            "UPDATE applications SET status = ? WHERE id = ?",
            (payload.status.strip().lower(), application_id),
        )
        connection.commit()

    return {"id": application_id, "status": payload.status.strip().lower()}
