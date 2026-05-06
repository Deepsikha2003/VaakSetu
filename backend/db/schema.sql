-- VaakSetu Database Schema (SQLite)
-- Zero config needed — just run this SQL

CREATE TABLE IF NOT EXISTS calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT UNIQUE NOT NULL,
    caller_number TEXT NOT NULL,
    agent_id TEXT DEFAULT 'AGENT-001',
    language TEXT,
    status TEXT DEFAULT 'active',
    utcs_score REAL DEFAULT 0.0,
    utcs_level TEXT DEFAULT 'MINIMAL',
    summary TEXT,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    takeover_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transcripts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT NOT NULL REFERENCES calls(call_id),
    text TEXT NOT NULL,
    language TEXT,
    asr_latency_ms REAL DEFAULT 0,
    keywords_json TEXT,
    nlp_json TEXT,
    emotion_json TEXT,
    utcs_json TEXT,
    noise_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT NOT NULL REFERENCES calls(call_id),
    status TEXT,
    summary_text TEXT,
    corrections TEXT,
    attempts INTEGER DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feedback_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT NOT NULL REFERENCES calls(call_id),
    agent_id TEXT NOT NULL,
    original_interpretation TEXT,
    corrected_interpretation TEXT,
    correction_type TEXT,
    applied_to_model BOOLEAN DEFAULT 0,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    call_id TEXT,
    message TEXT,
    severity TEXT DEFAULT 'info',
    metadata_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_utcs ON calls(utcs_level);
CREATE INDEX IF NOT EXISTS idx_transcripts_call ON transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON event_logs(event_type);
