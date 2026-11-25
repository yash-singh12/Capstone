"""Employer job posting and applicant review routes."""

import uuid
from pathlib import Path
from typing import Literal
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.responses import Response
from pydantic import BaseModel, Field

from ..database import database_connection
from ..services.geo_service import haversine_km


router = APIRouter(prefix="/api/employer", tags=["employer"])


class RequiredSkill(BaseModel):
    name: str = Field(min_length=1)
    importance: Literal["High", "Medium", "Low"]
    reason: str = Field(min_length=1)


class JobRequest(BaseModel):
    employer_id: str = Field(min_length=1)
    title: str = Field(min_length=1)
    company: str = Field(min_length=1)
    tag: Literal["MSME", "Startup", "PSU-Vendor"]
    address: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    salary: str = Field(min_length=1)
    bus_route: str = Field(min_length=1)
    desc: str = Field(min_length=1)
    required_skills: list[RequiredSkill] = Field(min_length=1)


def require_employer(connection, employer_id: str) -> None:
    employer = connection.execute(
        "SELECT role FROM users WHERE id = ?",
        (employer_id,),
    ).fetchone()
    if not employer or employer["role"] != "employer":
        raise HTTPException(status_code=403, detail="Employer access required")


def require_owned_job(connection, employer_id: str, job_id: str):
    job = connection.execute(
        "SELECT id, latitude, longitude FROM jobs WHERE id = ? AND employer_id = ?",
        (job_id, employer_id),
    ).fetchone()
    if not job:
        raise HTTPException(status_code=404, detail="Job posting not found")
    return job


@router.post("/jobs", status_code=status.HTTP_201_CREATED)
def create_job(payload: JobRequest) -> dict:
    skill_names = [skill.name.strip().casefold() for skill in payload.required_skills]
    if any(not name for name in skill_names):
        raise HTTPException(status_code=422, detail="Required skill names cannot be empty")
    if len(set(skill_names)) != len(skill_names):
        raise HTTPException(status_code=422, detail="Required skills must be unique")
    if any(not skill.reason.strip() for skill in payload.required_skills):
        raise HTTPException(status_code=422, detail="Required skill reasons cannot be empty")

    job_id = f"employer-{uuid.uuid4()}"
    with database_connection() as connection:
        require_employer(connection, payload.employer_id)
        connection.execute(
            """
            INSERT INTO jobs
                (id, title, company, tag, address, latitude, longitude, salary,
                 bus_route, desc, employer_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                job_id,
                payload.title.strip(),
                payload.company.strip(),
                payload.tag,
                payload.address.strip(),
                payload.latitude,
                payload.longitude,
                payload.salary.strip(),
                payload.bus_route.strip(),
                payload.desc.strip(),
                payload.employer_id,
            ),
        )

        for required_skill in payload.required_skills:
            skill_name = required_skill.name.strip()
            connection.execute(
                "INSERT OR IGNORE INTO skills (name, category) VALUES (?, ?)",
                (skill_name, "General"),
            )
            skill = connection.execute(
                "SELECT id FROM skills WHERE name = ?",
                (skill_name,),
            ).fetchone()
            connection.execute(
                """
                INSERT INTO job_skills (job_id, skill_id, importance, reason)
                VALUES (?, ?, ?, ?)
                """,
                (job_id, skill["id"], required_skill.importance, required_skill.reason.strip()),
            )
        connection.commit()

    return {
        "id": job_id,
        "title": payload.title.strip(),
        "company": payload.company.strip(),
        "tag": payload.tag,
        "address": payload.address.strip(),
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "salary": payload.salary.strip(),
        "bus_route": payload.bus_route.strip(),
        "desc": payload.desc.strip(),
        "required_skills": [skill.model_dump() for skill in payload.required_skills],
    }


@router.get("/jobs")
def list_employer_jobs(employer_id: str = Query(min_length=1)) -> list[dict]:
    with database_connection() as connection:
        require_employer(connection, employer_id)
        jobs = connection.execute(
            """
            SELECT j.id, j.title, j.company, j.tag, j.address, j.latitude,
                   j.longitude, j.salary, j.bus_route, j.desc,
                   COUNT(a.id) AS applicant_count
            FROM jobs j
            LEFT JOIN applications a ON a.job_id = j.id
            WHERE j.employer_id = ?
            GROUP BY j.id
            ORDER BY j.title
            """,
            (employer_id,),
        ).fetchall()
    return [dict(job) for job in jobs]


@router.get("/jobs/{job_id}/applicants")
def list_applicants(job_id: str, employer_id: str = Query(min_length=1)) -> list[dict]:
    with database_connection() as connection:
        require_employer(connection, employer_id)
        job = require_owned_job(connection, employer_id, job_id)
        required_rows = connection.execute(
            """
            SELECT s.name
            FROM job_skills js
            JOIN skills s ON s.id = js.skill_id
            WHERE js.job_id = ?
            """,
            (job_id,),
        ).fetchall()
        applicant_rows = connection.execute(
            """
            SELECT a.id AS application_id, a.status, a.applied_at,
                   a.readiness_score, s.user_id, s.name, s.branch, s.cgpa,
                   s.latitude, s.longitude, s.commute_mode,
                   s.resume_filename,
                   (SELECT m.score FROM mock_attempts m
                    WHERE m.student_id = a.student_id AND m.job_id = a.job_id
                    ORDER BY m.completed_at DESC LIMIT 1) AS mock_score,
                   (SELECT m.total FROM mock_attempts m
                    WHERE m.student_id = a.student_id AND m.job_id = a.job_id
                    ORDER BY m.completed_at DESC LIMIT 1) AS mock_total
            FROM applications a
            JOIN students s ON s.user_id = a.student_id
            WHERE a.job_id = ?
            ORDER BY a.readiness_score DESC, a.applied_at ASC
            """,
            (job_id,),
        ).fetchall()
        student_skill_rows = connection.execute(
            """
            SELECT ss.student_id, s.name
            FROM student_skills ss
            JOIN skills s ON s.id = ss.skill_id
            JOIN applications a ON a.student_id = ss.student_id
            WHERE a.job_id = ?
            """,
            (job_id,),
        ).fetchall()

    skills_by_student = {}
    for row in student_skill_rows:
        skills_by_student.setdefault(row["student_id"], set()).add(row["name"].casefold())
    required_names = [row["name"].casefold() for row in required_rows]

    results = []
    for applicant in applicant_rows:
        student_skills = skills_by_student.get(applicant["user_id"], set())
        match_percent = round(
            sum(skill in student_skills for skill in required_names) / len(required_names) * 100,
            1,
        ) if required_names else 0
        commute_distance = None
        if applicant["latitude"] is not None and applicant["longitude"] is not None:
            commute_distance = round(
                haversine_km(
                    float(applicant["latitude"]),
                    float(applicant["longitude"]),
                    float(job["latitude"]),
                    float(job["longitude"]),
                ),
                1,
            )
        results.append({
            "application_id": applicant["application_id"],
            "student_id": applicant["user_id"],
            "name": applicant["name"],
            "branch": applicant["branch"],
            "cgpa": applicant["cgpa"],
            "commute_mode": applicant["commute_mode"],
            "commute_distance_km": commute_distance,
            "match_percent": match_percent,
            "readiness_score": applicant["readiness_score"],
            "mock_score": applicant["mock_score"],
            "mock_total": applicant["mock_total"],
            "status": applicant["status"],
            "applied_at": applicant["applied_at"],
            "has_resume": bool(applicant["resume_filename"]),
        })
    results.sort(
        key=lambda item: (
            item["match_percent"],
            item["readiness_score"] or 0,
            item["cgpa"] or 0,
        ),
        reverse=True,
    )
    return results


@router.get("/jobs/{job_id}/applicants/{student_id}/resume")
def view_resume(job_id: str, student_id: str, employer_id: str = Query(min_length=1)) -> Response:
    with database_connection() as connection:
        require_employer(connection, employer_id)
        require_owned_job(connection, employer_id, job_id)
        resume = connection.execute(
            """
            SELECT s.resume_filename, s.resume_data
            FROM students s
            JOIN applications a ON a.student_id = s.user_id
            WHERE s.user_id = ? AND a.job_id = ?
            """,
            (student_id, job_id),
        ).fetchone()
        if not resume or not resume["resume_data"]:
            raise HTTPException(status_code=404, detail="No resume is available for this applicant")
    filename = Path(resume["resume_filename"]).name.replace("\r", "").replace("\n", "").replace('"', "")
    return Response(
        content=bytes(resume["resume_data"]),
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename*=UTF-8''{quote(filename)}"},
    )
