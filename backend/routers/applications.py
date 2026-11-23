"""Job application routes."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from ..database import database_connection


router = APIRouter(prefix="/api/applications", tags=["applications"])


class ApplicationRequest(BaseModel):
    student_id: str = Field(min_length=1)
    job_id: str = Field(min_length=1)
    readiness_score: float | None = Field(default=None, ge=0, le=100)


class StatusRequest(BaseModel):
    status: str = Field(min_length=1)


@router.post("", status_code=status.HTTP_201_CREATED)
def submit_application(payload: ApplicationRequest) -> dict:
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
                   j.title, j.company, j.tag, j.address, j.salary
            FROM applications a
            JOIN jobs j ON j.id = a.job_id
            WHERE a.student_id = ?
              AND lower(a.status) NOT IN ('rejected', 'withdrawn')
            ORDER BY a.applied_at DESC
            """,
            (student_id,),
        ).fetchall()

    return [dict(row) for row in rows]


@router.patch("/{application_id}/status")
def update_application_status(application_id: str, payload: StatusRequest) -> dict:
    with database_connection() as connection:
        application = connection.execute(
            "SELECT id, status FROM applications WHERE id = ?",
            (application_id,),
        ).fetchone()
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")

        connection.execute(
            "UPDATE applications SET status = ? WHERE id = ?",
            (payload.status.strip().lower(), application_id),
        )
        connection.commit()

    return {"id": application_id, "status": payload.status.strip().lower()}
