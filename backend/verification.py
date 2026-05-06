"""
VaakSetu — Verification Loop Engine
Confirmation loop logic: yes/no/partial state machine
"""
import logging
from typing import Dict, Any, Optional
from enum import Enum

logger = logging.getLogger("vaaksetu.verification")


class VerificationState(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PARTIALLY_CONFIRMED = "partially_confirmed"
    DENIED = "denied"
    TAKEOVER = "takeover"


class VerificationEngine:
    def __init__(self):
        self._ready = True
        self._states: Dict[str, Dict] = {}
        logger.info("VerificationEngine initialized")

    def process_response(self, call_id: str, confirmed: bool, corrections: Optional[str] = None) -> Dict[str, Any]:
        """Process citizen's yes/no/partial response"""
        state = self._states.get(call_id, {"attempts": 0, "state": VerificationState.PENDING})
        state["attempts"] += 1

        if confirmed:
            state["state"] = VerificationState.CONFIRMED
            result = {
                "status": "confirmed",
                "message": "Understanding confirmed by citizen",
                "confirmed_summary": state.get("summary", ""),
                "language": state.get("language", "en"),
                "attempts": state["attempts"],
            }
        elif corrections:
            state["state"] = VerificationState.PARTIALLY_CONFIRMED
            state["corrections"] = corrections
            result = {
                "status": "partially_confirmed",
                "message": "Citizen provided corrections",
                "corrections": corrections,
                "attempts": state["attempts"],
                "needs_reprocessing": True,
            }
        else:
            state["state"] = VerificationState.DENIED
            if state["attempts"] >= 2:
                state["state"] = VerificationState.TAKEOVER
                result = {
                    "status": "takeover",
                    "message": "Understanding denied twice — flagging for human takeover",
                    "attempts": state["attempts"],
                    "action": "HUMAN_TAKEOVER",
                }
            else:
                result = {
                    "status": "denied",
                    "message": "Understanding denied — retrying",
                    "attempts": state["attempts"],
                    "action": "RETRY",
                }

        self._states[call_id] = state
        return result

    def set_summary(self, call_id: str, summary: str, language: str = "en"):
        """Set the verification summary for a call"""
        if call_id not in self._states:
            self._states[call_id] = {"attempts": 0, "state": VerificationState.PENDING}
        self._states[call_id]["summary"] = summary
        self._states[call_id]["language"] = language

    def generate_summary(self, call_data: Dict) -> Dict[str, str]:
        """Generate verification summary from call data"""
        nlp = call_data.get("nlp", {})
        summary = nlp.get("summary", "your reported issue")
        location = nlp.get("entities", {}).get("location", "your area")
        lang = call_data.get("transcript", {}).get("language", "en")

        templates = {
            "kn": f"ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ, ನೀವು {location} ನಲ್ಲಿ {summary} ವರದಿ ಮಾಡುತ್ತಿದ್ದೀರಿ. ಇದು ಸರಿಯೇ?",
            "hi": f"मैं समझ गया, आप {location} में {summary} की रिपोर्ट कर रहे हैं। क्या यह सही है?",
            "en": f"I understand you are reporting {summary} at {location}. Is that correct?",
        }

        confirmation = templates.get(lang, templates["en"])
        return {"summary": confirmation, "language": lang}

    def is_ready(self) -> bool:
        return self._ready
