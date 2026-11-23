"""Local PDF resume parsing and skill extraction."""

import re
from io import BytesIO

from pypdf import PdfReader


TECH_SKILLS = {
    "react": "React",
    "next.js": "React",
    "nextjs": "React",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "tailwind": "Tailwind",
    "tailwind css": "Tailwind",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Node.js",
    "express.js": "Node.js",
    "mongodb": "MongoDB",
    "mongo db": "MongoDB",
    "sql": "SQL",
    "mysql": "SQL",
    "postgresql": "SQL",
    "git": "Git",
    "github": "Git",
    "docker": "Docker",
    "redis": "Redis",
    "aws": "AWS",
    "figma": "Figma",
    "java": "Java",
    "spring boot": "Spring Boot",
    "selenium": "Selenium",
    "manual testing": "Manual Testing",
    "jira": "Jira",
    "linux": "Linux",
    "networking": "Networking",
    "excel": "Excel",
    "python": "Python",
    "rest": "REST",
    "api": "REST",
}

QUALIFICATION_PATTERN = re.compile(
    r"\b(?:B\.?Tech|B\.?E\.?|M\.?Tech|M\.?E\.?|BCA|MCA|"
    r"Bachelor(?:'s)?|Master(?:'s)?|Diploma)\b[^.\n]{0,100}",
    re.IGNORECASE,
)
PROJECT_PATTERN = re.compile(
    r"(?:projects?|experience)\s*[:\-]?\s*(.{0,700})",
    re.IGNORECASE | re.DOTALL,
)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(pdf_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    text = "\n".join(pages)
    if not text.strip():
        raise ValueError("The PDF does not contain readable text")
    return text


def extract_skills(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", text).lower()
    found: set[str] = set()

    for alias, canonical in TECH_SKILLS.items():
        pattern = rf"(?<![a-z0-9]){re.escape(alias)}(?![a-z0-9])"
        if re.search(pattern, normalized, re.IGNORECASE):
            found.add(canonical)

    return sorted(found)


def extract_projects(text: str) -> list[str]:
    matches = PROJECT_PATTERN.findall(text)
    projects: list[str] = []
    for match in matches:
        cleaned = re.sub(r"\s+", " ", match).strip()
        if cleaned:
            projects.append(cleaned[:500])
    return projects


def extract_qualifications(text: str) -> list[str]:
    matches = QUALIFICATION_PATTERN.findall(text)
    return list(dict.fromkeys(match.strip() for match in matches if match.strip()))


def parse_resume_pdf(pdf_bytes: bytes) -> dict:
    text = extract_text_from_pdf(pdf_bytes)
    projects = extract_projects(text)
    qualifications = extract_qualifications(text)
    skills = extract_skills(text)

    summary_parts = projects[:3] or [text[:1000]]
    summary = "\n".join(
        f"{qualification}\n{project}"
        for qualification in qualifications[:2]
        for project in summary_parts[:1]
    )
    if not summary:
        summary = text[:2000]

    return {
        "text": text,
        "skills": skills,
        "projects": projects,
        "qualifications": qualifications,
        "summary": summary or text[:2000],
    }
