"""SQLite database connection helpers for PlaceLocal.AI."""

import sqlite3
from pathlib import Path
from typing import Iterator
from contextlib import contextmanager


BACKEND_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BACKEND_DIR / "placelocal.db"
SCHEMA_PATH = BACKEND_DIR / "schema.sql"


def get_connection(database_path: str | Path = DATABASE_PATH) -> sqlite3.Connection:
    """Return an initialized SQLite connection with foreign keys enabled."""
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


@contextmanager
def database_connection(database_path: str | Path = DATABASE_PATH) -> Iterator[sqlite3.Connection]:
    """Provide a connection and close it automatically after use."""
    connection = get_connection(database_path)
    try:
        yield connection
    finally:
        connection.close()


def initialize_database(database_path: str | Path = DATABASE_PATH) -> None:
    """Create the schema if it does not already exist."""
    with database_connection(database_path) as connection:
        connection.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
        student_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(students)")
        }
        if "resume_filename" not in student_columns:
            connection.execute("ALTER TABLE students ADD COLUMN resume_filename TEXT")
        if "resume_data" not in student_columns:
            connection.execute("ALTER TABLE students ADD COLUMN resume_data BLOB")

        job_columns = {
            row["name"] for row in connection.execute("PRAGMA table_info(jobs)")
        }
        if "employer_id" not in job_columns:
            connection.execute(
                "ALTER TABLE jobs ADD COLUMN employer_id TEXT REFERENCES users(id) ON DELETE CASCADE"
            )
