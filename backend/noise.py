"""
VaakSetu — Background Noise Analysis Engine
Classifies background audio for threat signals: screaming, struggle, crying
"""
import logging
from typing import Dict, Any

logger = logging.getLogger("vaaksetu.noise")


class NoiseEngine:
    def __init__(self):
        self._ready = True
        logger.info("NoiseEngine initialized")

    def analyze(self, audio_bytes: bytes) -> Dict[str, Any]:
        """Analyze background audio channel for threat indicators"""
        try:
            import librosa
            import numpy as np
            import tempfile, os

            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name

            y, sr = librosa.load(temp_path, sr=16000)
            os.unlink(temp_path)

            rms = float(librosa.feature.rms(y=y).mean())
            zcr = float(librosa.feature.zero_crossing_rate(y).mean())
            spec_bw = float(librosa.feature.spectral_bandwidth(y=y, sr=sr).mean())
            centroid = float(librosa.feature.spectral_centroid(y=y, sr=sr).mean())

            # Heuristic noise classification
            screaming = min(1.0, max(0, (centroid - 3000) / 2000 + rms * 8))
            struggle = min(1.0, max(0, (zcr - 0.1) * 5 + (spec_bw - 2000) / 3000))
            crying = min(1.0, max(0, (rms - 0.01) * 5 + (centroid - 1500) / 2000))

            # Determine dominant noise type
            scores = {"screaming": screaming, "struggle": struggle, "crying": crying}
            dominant = max(scores, key=scores.get)
            is_threat = max(scores.values()) > 0.4

            return {
                "screaming": round(screaming, 3),
                "struggle": round(struggle, 3),
                "crying": round(crying, 3),
                "dominant_type": dominant if is_threat else "ambient",
                "is_threat": is_threat,
                "confidence": round(max(scores.values()), 3),
            }
        except Exception as e:
            logger.error(f"Noise analysis error: {e}")
            return {"screaming": 0, "struggle": 0, "crying": 0, "dominant_type": "ambient", "is_threat": False, "confidence": 0}

    def simulate_distress(self) -> Dict[str, Any]:
        """Simulate a distress noise scenario for demo"""
        return {
            "screaming": 0.85,
            "struggle": 0.72,
            "crying": 0.45,
            "dominant_type": "screaming",
            "is_threat": True,
            "confidence": 0.85,
        }

    def is_ready(self) -> bool:
        return self._ready
