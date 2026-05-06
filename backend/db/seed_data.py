"""
VaakSetu — Seed Data
Pre-seeds 3 demo calls so the dashboard is never empty on first launch
"""
import sqlite3
import json
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "vaaksetu.db")

SEED_CALLS = [
    {
        "call_id": "CALL-001",
        "caller_number": "+919876543210",
        "agent_id": "AGENT-001",
        "language": "kn",
        "status": "completed",
        "utcs_score": 145,
        "utcs_level": "LOW",
        "summary": "Road pothole complaint in Rajajinagar, Bengaluru — unattended for 3 days, children facing difficulty going to school",
        "started_at": "2026-05-04T10:15:00",
        "ended_at": "2026-05-04T10:18:30",
    },
    {
        "call_id": "CALL-002",
        "caller_number": "+919876543211",
        "agent_id": "AGENT-002",
        "language": "hi",
        "status": "completed",
        "utcs_score": 720,
        "utcs_level": "CRITICAL",
        "summary": "Domestic violence emergency — citizen being beaten, requesting immediate police help",
        "started_at": "2026-05-04T11:30:00",
        "ended_at": "2026-05-04T11:35:00",
    },
    {
        "call_id": "CALL-003",
        "caller_number": "+919876543212",
        "agent_id": "AGENT-001",
        "language": "en",
        "status": "completed",
        "utcs_score": 580,
        "utcs_level": "CRITICAL",
        "summary": "Silent emergency — citizen barely able to speak, background screaming and struggle detected by noise analysis",
        "started_at": "2026-05-04T14:00:00",
        "ended_at": "2026-05-04T14:08:00",
    },
]

def seed():
    """Insert seed data into SQLite database"""
    # First run schema
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    conn = sqlite3.connect(DB_PATH)
    
    with open(schema_path, "r") as f:
        conn.executescript(f.read())
    
    for call in SEED_CALLS:
        try:
            conn.execute(
                """INSERT OR IGNORE INTO calls 
                   (call_id, caller_number, agent_id, language, status, utcs_score, utcs_level, summary, started_at, ended_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (call["call_id"], call["caller_number"], call["agent_id"], call["language"],
                 call["status"], call["utcs_score"], call["utcs_level"], call["summary"],
                 call["started_at"], call["ended_at"])
            )
            conn.execute(
                """INSERT OR IGNORE INTO event_logs (event_type, call_id, message, severity)
                   VALUES (?, ?, ?, ?)""",
                ("call_completed", call["call_id"],
                 f"Call {call['call_id']}: {call['summary'][:60]}",
                 call["utcs_level"].lower())
            )
        except Exception as e:
            print(f"Seed error for {call['call_id']}: {e}")
    
    conn.commit()
    conn.close()
    print(f"✅ Seeded {len(SEED_CALLS)} demo calls into {DB_PATH}")

if __name__ == "__main__":
    seed()
