"""
VaakSetu — SQLAlchemy ORM Models
Call, Transcript, VerificationLog, FeedbackEntry, EventLog tables
"""
from sqlalchemy import create_engine, Column, Integer, String, Float, Text, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vaaksetu.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Call(Base):
    __tablename__ = "calls"
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String(50), unique=True, index=True, nullable=False)
    caller_number = Column(String(20), nullable=False)
    agent_id = Column(String(50), default="AGENT-001")
    language = Column(String(10))
    status = Column(String(20), default="active")  # active, completed, takeover
    utcs_score = Column(Float, default=0.0)
    utcs_level = Column(String(20), default="MINIMAL")
    summary = Column(Text)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    takeover_agent = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transcripts = relationship("Transcript", back_populates="call")
    verifications = relationship("VerificationLog", back_populates="call")
    feedback_entries = relationship("FeedbackEntry", back_populates="call")


class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String(50), ForeignKey("calls.call_id"), nullable=False)
    text = Column(Text, nullable=False)
    language = Column(String(10))
    asr_latency_ms = Column(Float, default=0)
    keywords_json = Column(JSON)
    nlp_json = Column(JSON)
    emotion_json = Column(JSON)
    utcs_json = Column(JSON)
    noise_json = Column(JSON)
    timestamp = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="transcripts")


class VerificationLog(Base):
    __tablename__ = "verification_logs"
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String(50), ForeignKey("calls.call_id"), nullable=False)
    status = Column(String(30))  # confirmed, denied, partially_confirmed, takeover
    summary_text = Column(Text)
    corrections = Column(Text, nullable=True)
    attempts = Column(Integer, default=0)
    timestamp = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="verifications")


class FeedbackEntry(Base):
    __tablename__ = "feedback_entries"
    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String(50), ForeignKey("calls.call_id"), nullable=False)
    agent_id = Column(String(50), nullable=False)
    original_interpretation = Column(Text)
    corrected_interpretation = Column(Text)
    correction_type = Column(String(30))  # intent, entity, summary, severity
    applied_to_model = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    call = relationship("Call", back_populates="feedback_entries")


class EventLog(Base):
    __tablename__ = "event_logs"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False)
    call_id = Column(String(50), nullable=True)
    message = Column(Text)
    severity = Column(String(20), default="info")
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


def init_database():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
    return engine


def get_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
