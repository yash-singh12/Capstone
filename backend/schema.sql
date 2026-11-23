PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    role TEXT
);

CREATE TABLE IF NOT EXISTS students (
    user_id TEXT PRIMARY KEY,
    name TEXT,
    branch TEXT,
    roll_no TEXT,
    cgpa REAL,
    home_address TEXT,
    latitude REAL,
    longitude REAL,
    commute_mode TEXT,
    employability_score REAL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    category TEXT
);

CREATE TABLE IF NOT EXISTS student_skills (
    student_id TEXT NOT NULL,
    skill_id INTEGER NOT NULL,
    PRIMARY KEY (student_id, skill_id),
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT,
    company TEXT,
    tag TEXT,
    address TEXT,
    latitude REAL,
    longitude REAL,
    salary TEXT,
    bus_route TEXT,
    desc TEXT
);

CREATE TABLE IF NOT EXISTS job_skills (
    job_id TEXT NOT NULL,
    skill_id INTEGER NOT NULL,
    importance TEXT,
    reason TEXT,
    PRIMARY KEY (job_id, skill_id),
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    job_id TEXT,
    status TEXT,
    readiness_score REAL,
    applied_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mock_attempts (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    job_id TEXT,
    score INTEGER,
    total INTEGER,
    completed_at DATETIME,
    FOREIGN KEY (student_id) REFERENCES students(user_id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_student_skills_skill
    ON student_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_job_skills_skill
    ON job_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_applications_student
    ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job
    ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_student
    ON mock_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_mock_attempts_job
    ON mock_attempts(job_id);
