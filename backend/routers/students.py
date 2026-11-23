"""Student profile and resume routes."""

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from ..database import database_connection
from ..services.resume_parser import parse_resume_pdf
from ..services.vector_engine import MODEL_NAME, encode, get_model


router = APIRouter(tags=["students"])


@router.post("/api/resume/upload")
async def upload_resume(
    student_id: str = Form(...),
    file: UploadFile = File(...),
) -> dict:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="The uploaded PDF is empty")

    try:
        parsed = parse_resume_pdf(pdf_bytes)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    except Exception as error:
        raise HTTPException(status_code=422, detail="Unable to parse the uploaded PDF") from error

    # Generate and cache the dense resume embedding on the local CPU.
    resume_vector = encode(parsed["summary"])

    with database_connection() as connection:
        student = connection.execute(
            "SELECT user_id FROM students WHERE user_id = ?",
            (student_id,),
        ).fetchone()
        if not student:
            raise HTTPException(status_code=404, detail="Student not found")

        connection.execute(
            """
            DELETE FROM student_skills
            WHERE student_id = ?
            """,
            (student_id,),
        )

        for skill_name in parsed["skills"]:
            skill = connection.execute(
                "SELECT id FROM skills WHERE name = ?",
                (skill_name,),
            ).fetchone()
            if skill:
                connection.execute(
                    "INSERT OR IGNORE INTO student_skills (student_id, skill_id) VALUES (?, ?)",
                    (student_id, skill["id"]),
                )

        connection.commit()

    return {
        "student_id": student_id,
        "filename": file.filename,
        "skills": parsed["skills"],
        "projects": parsed["projects"],
        "qualifications": parsed["qualifications"],
        "embedding_dimensions": int(resume_vector.shape[0]),
        "embedding_model": MODEL_NAME if get_model() is not None else "local-deterministic-fallback",
    }
