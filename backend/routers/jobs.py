"""Job listing and gap-analysis routes."""

from fastapi import APIRouter, HTTPException, Query

from ..database import database_connection
from ..services.geo_service import (
    SSTC_LOCATION,
    estimate_commute_minutes,
    haversine_km,
)


router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("")
def list_jobs(
    radius: float = Query(default=50.0, ge=0),
    q: str | None = None,
    student_id: str | None = None,
) -> list[dict]:
    with database_connection() as connection:
        origin_lat, origin_lng = SSTC_LOCATION
        if student_id:
            student = connection.execute(
                "SELECT latitude, longitude FROM students WHERE user_id = ?",
                (student_id,),
            ).fetchone()
            if student and student["latitude"] is not None and student["longitude"] is not None:
                origin_lat = float(student["latitude"])
                origin_lng = float(student["longitude"])

        rows = connection.execute(
            """
            SELECT id, title, company, tag, address, latitude, longitude,
                   salary, bus_route, desc
            FROM jobs
            ORDER BY title
            """
        ).fetchall()
        skill_rows = connection.execute(
            """
            SELECT js.job_id, s.name
            FROM job_skills js
            JOIN skills s ON s.id = js.skill_id
            """
        ).fetchall()

    query = q.strip().lower() if q else None
    required_by_job = {}
    for skill_row in skill_rows:
        required_by_job.setdefault(skill_row["job_id"], []).append(skill_row["name"])
    result = []
    for row in rows:
        if row["latitude"] is None or row["longitude"] is None:
            continue

        distance = haversine_km(
            origin_lat,
            origin_lng,
            float(row["latitude"]),
            float(row["longitude"]),
        )
        if distance > radius:
            continue

        searchable = " ".join(
            str(value or "")
            for value in (
                row["title"],
                row["company"],
                row["tag"],
                row["address"],
                row["desc"],
            )
        ).lower()
        if query and query not in searchable:
            continue

        result.append({
            "id": row["id"],
            "title": row["title"],
            "company": row["company"],
            "tag": row["tag"],
            "address": row["address"],
            "latitude": row["latitude"],
            "longitude": row["longitude"],
            "lat": row["latitude"],
            "lng": row["longitude"],
            "salary": row["salary"],
            "busRoute": row["bus_route"],
            "bus_route": row["bus_route"],
            "desc": row["desc"],
            "required": required_by_job.get(row["id"], []),
            "distance_km": round(distance, 1),
            "commute_min": estimate_commute_minutes(distance),
        })

    result.sort(key=lambda job: job["distance_km"])
    return result


@router.get("/{job_id}")
def get_job(job_id: str) -> dict:
    with database_connection() as connection:
        job = connection.execute(
            """
            SELECT id, title, company, tag, address, latitude, longitude,
                   salary, bus_route, desc
            FROM jobs
            WHERE id = ?
            """,
            (job_id,),
        ).fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        required = connection.execute(
            """
            SELECT s.name
            FROM job_skills js
            JOIN skills s ON s.id = js.skill_id
            WHERE js.job_id = ?
            ORDER BY s.name
            """,
            (job_id,),
        ).fetchall()

    distance = haversine_km(
        SSTC_LOCATION[0],
        SSTC_LOCATION[1],
        float(job["latitude"]),
        float(job["longitude"]),
    )
    commute = estimate_commute_minutes(distance)
    return {
        "id": job["id"],
        "title": job["title"],
        "company": job["company"],
        "tag": job["tag"],
        "address": job["address"],
        "latitude": job["latitude"],
        "longitude": job["longitude"],
        "lat": job["latitude"],
        "lng": job["longitude"],
        "salary": job["salary"],
        "bus_route": job["bus_route"],
        "busRoute": job["bus_route"],
        "desc": job["desc"],
        "distance_km": round(distance, 1),
        "distanceKm": round(distance, 1),
        "commute_min": commute,
        "commuteMin": commute,
        "required": [row["name"] for row in required],
    }


@router.get("/{job_id}/gap")
def get_job_gap(job_id: str, student_id: str) -> dict:
    with database_connection() as connection:
        job = connection.execute(
            "SELECT id, title, company FROM jobs WHERE id = ?",
            (job_id,),
        ).fetchone()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        required_rows = connection.execute(
            """
            SELECT s.name, js.importance, js.reason
            FROM job_skills js
            JOIN skills s ON s.id = js.skill_id
            WHERE js.job_id = ?
            ORDER BY s.name
            """,
            (job_id,),
        ).fetchall()

        student_rows = connection.execute(
            """
            SELECT s.name
            FROM student_skills ss
            JOIN skills s ON s.id = ss.skill_id
            WHERE ss.student_id = ?
            """,
            (student_id,),
        ).fetchall()

    student_skills = {row["name"].lower(): row["name"] for row in student_rows}
    matched = []
    missing = []
    for row in required_rows:
        skill = row["name"]
        item = {
            "skill": skill,
            "importance": row["importance"] or "Medium",
            "reason": row["reason"] or "Listed in the job description",
        }
        if skill.lower() in student_skills:
            matched.append(skill)
        else:
            missing.append(item)

    return {
        "job_id": job["id"],
        "title": job["title"],
        "company": job["company"],
        "matched": matched,
        "missing": missing,
        "match_percent": round(
            len(matched) / len(required_rows) * 100,
            1,
        ) if required_rows else 0,
    }
