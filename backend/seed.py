"""Create and seed the local PlaceLocal.AI SQLite database."""

from database import DATABASE_PATH, initialize_database, get_connection


STANDARD_SKILLS = [
    ("React", "Frontend"),
    ("JavaScript", "Programming"),
    ("Tailwind", "Frontend"),
    ("TypeScript", "Programming"),
    ("Git", "Tools"),
    ("Figma", "Design"),
    ("REST", "Backend"),
    ("Docker", "DevOps"),
    ("SQL", "Database"),
    ("Excel", "Tools"),
    ("Node.js", "Backend"),
    ("MongoDB", "Database"),
    ("Linux", "Operations"),
    ("Networking", "Operations"),
    ("Java", "Programming"),
    ("Manual Testing", "Quality Assurance"),
    ("Selenium", "Quality Assurance"),
    ("Jira", "Tools"),
    ("Spring Boot", "Backend"),
    ("Redis", "Database"),
    ("AWS", "Cloud"),
]

JOBS = [
    {
        "id": "pixelkraft-fe",
        "title": "Frontend Intern",
        "company": "PixelKraft Solutions",
        "tag": "Startup",
        "address": "Civic Centre, Bhilai",
        "latitude": 21.1947,
        "longitude": 81.3420,
        "salary": "₹10k stipend • PPO 3.2 LPA",
        "bus_route": "Junwani → Supela → Civic Centre via GE Road",
        "desc": "Build responsive pages for local MSME clients. React + Tailwind codebase migrating to TypeScript. Day-scholar friendly, 5-day week in Bhilai office.",
    },
    {
        "id": "agarwal-sql",
        "title": "Data Entry + SQL Assistant",
        "company": "Agarwal Logistics (MSME)",
        "tag": "MSME",
        "address": "Junwani, Bhilai",
        "latitude": 21.2112,
        "longitude": 81.3528,
        "salary": "₹8k stipend",
        "bus_route": "Walkable from SSTC gate",
        "desc": "Maintain dispatch DB, write basic SQL reports. Ideal first internship 5 min from campus.",
    },
    {
        "id": "aditya-web",
        "title": "Jr. Web Dev Trainee",
        "company": "Aditya eServices",
        "tag": "MSME",
        "address": "Supela, Bhilai",
        "latitude": 21.1954,
        "longitude": 81.3632,
        "salary": "2.2 LPA trainee",
        "bus_route": "Junwani → Supela direct auto",
        "desc": "Service websites for Chhattisgarh retailers. MERN stack, Hindi-speaking team.",
    },
    {
        "id": "steelops-support",
        "title": "Support Engineer Trainee",
        "company": "SteelOps IT (SAIL-Bhilai Vendor)",
        "tag": "PSU-Vendor",
        "address": "Bhilai Township, Sector-27",
        "latitude": 21.2210,
        "longitude": 81.3915,
        "salary": "2.4 LPA",
        "bus_route": "College bus → Township",
        "desc": "Plant-vendor helpdesk + intranet support inside Bhilai Steel Plant township.",
    },
    {
        "id": "shakti-qa",
        "title": "QA Manual + Automation Trainee",
        "company": "Shakti Soft (BSP Vendor)",
        "tag": "MSME",
        "address": "Sector-27, Bhilai",
        "latitude": 21.2225,
        "longitude": 81.3900,
        "salary": "₹9k stipend",
        "bus_route": "Supela → Sector-27",
        "desc": "Test ERP modules used by SAIL vendors. Selenium + Java training provided.",
    },
    {
        "id": "designdurg-ui",
        "title": "UI Intern",
        "company": "DesignDurg Studio",
        "tag": "Startup",
        "address": "Malviya Nagar, Durg",
        "latitude": 21.1700,
        "longitude": 81.3290,
        "salary": "₹7k stipend",
        "bus_route": "Junwani → Durg via NH53",
        "desc": "Design + build landing pages for Raipur/Durg cafes and coaching brands.",
    },
    {
        "id": "powerline-java",
        "title": "Java Trainee",
        "company": "Powerline Infotech (CSPDCL Vendor)",
        "tag": "PSU-Vendor",
        "address": "Ganjpara, Durg",
        "latitude": 21.1935,
        "longitude": 81.2990,
        "salary": "2.6 LPA",
        "bus_route": "Bhilai → Durg bus",
        "desc": "Billing utilities for power distribution clients in Chhattisgarh.",
    },
    {
        "id": "logitrack-be",
        "title": "Backend Trainee (Node)",
        "company": "LogiTrack Systems",
        "tag": "MSME",
        "address": "Industrial Estate, Durg",
        "latitude": 21.1680,
        "longitude": 81.2900,
        "salary": "2.8 LPA",
        "bus_route": "Supela → Industrial Estate",
        "desc": "Fleet APIs for CG transporters. Needs Redis caching + Docker basics.",
    },
    {
        "id": "krishisetu-fs",
        "title": "Full-Stack Intern",
        "company": "KrishiSetu (Agri-tech)",
        "tag": "Startup • IT Park",
        "address": "SDC IT Park, Tatibandh, Raipur",
        "latitude": 21.1690,
        "longitude": 81.6710,
        "salary": "₹15k stipend • PPO 5 LPA",
        "bus_route": "Bhilai → Raipur MEMU + auto",
        "desc": "Mandi-price app for CG farmers. Most aspirational role, hostel support.",
    },
    {
        "id": "finmudra-mern",
        "title": "MERN Intern",
        "company": "FinMudra",
        "tag": "Startup",
        "address": "Pandri, Raipur",
        "latitude": 21.2440,
        "longitude": 81.6480,
        "salary": "₹12k stipend",
        "bus_route": "Junwani → Raipur bus stand",
        "desc": "Micro-loan dashboard for self-help groups. TypeScript + AWS deploy.",
    },
]

JOB_REQUIREMENTS = {
    "pixelkraft-fe": ["React", "JavaScript", "Tailwind", "TypeScript", "Git", "Figma", "REST", "Docker"],
    "agarwal-sql": ["SQL", "Excel", "JavaScript", "Git"],
    "aditya-web": ["JavaScript", "React", "Node.js", "MongoDB", "Git", "REST"],
    "steelops-support": ["SQL", "Linux", "Networking", "Java", "Git"],
    "shakti-qa": ["Manual Testing", "Selenium", "Java", "SQL", "Jira"],
    "designdurg-ui": ["React", "Tailwind", "Figma", "JavaScript", "Git"],
    "powerline-java": ["Java", "Spring Boot", "SQL", "Git", "REST"],
    "logitrack-be": ["Node.js", "MongoDB", "Redis", "Docker", "REST", "Git"],
    "krishisetu-fs": ["React", "Node.js", "MongoDB", "TypeScript", "AWS", "Git"],
    "finmudra-mern": ["React", "Node.js", "TypeScript", "AWS", "MongoDB", "Docker"],
}


def seed() -> None:
    initialize_database(DATABASE_PATH)

    with get_connection(DATABASE_PATH) as connection:
        connection.executemany(
            "INSERT OR IGNORE INTO skills (name, category) VALUES (?, ?)",
            STANDARD_SKILLS,
        )
        connection.executemany(
            """
            UPDATE skills
            SET category = ?
            WHERE name = ?
            """,
            [(category, name) for name, category in STANDARD_SKILLS],
        )

        connection.executemany(
            """
            INSERT OR IGNORE INTO jobs
                (id, title, company, tag, address, latitude, longitude, salary, bus_route, desc)
            VALUES
                (:id, :title, :company, :tag, :address, :latitude, :longitude,
                 :salary, :bus_route, :desc)
            """,
            JOBS,
        )
        connection.executemany(
            """
            UPDATE jobs
            SET title = :title,
                company = :company,
                tag = :tag,
                address = :address,
                latitude = :latitude,
                longitude = :longitude,
                salary = :salary,
                bus_route = :bus_route,
                desc = :desc
            WHERE id = :id
            """,
            JOBS,
        )

        for job_id, skill_names in JOB_REQUIREMENTS.items():
            for skill_name in skill_names:
                skill = connection.execute(
                    "SELECT id FROM skills WHERE name = ?",
                    (skill_name,),
                ).fetchone()
                if skill is None:
                    continue

                importance = "High" if skill_name in {"React", "JavaScript", "Java", "SQL", "Node.js"} else "Medium"
                if skill_name in {"Redis", "Docker"}:
                    importance = "High"
                reason = f"Listed requirement for this job"

                connection.execute(
                    """
                    INSERT OR IGNORE INTO job_skills
                        (job_id, skill_id, importance, reason)
                    VALUES (?, ?, ?, ?)
                    """,
                    (job_id, skill["id"], importance, reason),
                )

        connection.commit()


if __name__ == "__main__":
    seed()
    print(f"Seeded PlaceLocal.AI database at {DATABASE_PATH}")
