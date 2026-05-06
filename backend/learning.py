"""
VaakSetu — Learning Pipeline
Feedback ingestion, correction logging, training signal exposure
"""
import logging
from typing import Dict, List, Any
from datetime import datetime

logger = logging.getLogger("vaaksetu.learning")


class LearningPipeline:
    def __init__(self):
        self.corrections: List[Dict] = []
        self.model_versions: List[Dict] = []

    def ingest_correction(self, call_id: str, original: str, corrected: str,
                          correction_type: str, agent_id: str) -> Dict:
        """Log a human correction for model improvement"""
        entry = {
            "call_id": call_id,
            "original": original,
            "corrected": corrected,
            "type": correction_type,
            "agent_id": agent_id,
            "timestamp": datetime.utcnow().isoformat(),
            "applied": False,
        }
        self.corrections.append(entry)
        logger.info(f"Learning: New {correction_type} correction for {call_id}")
        return entry

    def get_training_signals(self, correction_type: str = None) -> List[Dict]:
        """Export corrections as training signals"""
        signals = self.corrections
        if correction_type:
            signals = [s for s in signals if s["type"] == correction_type]
        return signals

    def get_stats(self) -> Dict:
        total = len(self.corrections)
        by_type = {}
        for c in self.corrections:
            t = c["type"]
            by_type[t] = by_type.get(t, 0) + 1
        return {"total_corrections": total, "by_type": by_type,
                "model_versions": len(self.model_versions)}
