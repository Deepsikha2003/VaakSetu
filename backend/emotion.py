"""
VaakSetu — Emotion Detection Engine
Librosa-based audio feature extraction for panic/fear/calm/distress scoring
"""
import logging, base64, tempfile, os
from typing import Dict, Any, Optional

logger = logging.getLogger("vaaksetu.emotion")


class EmotionEngine:
    def __init__(self):
        self._ready = True
        self.model = None
        logger.info("EmotionEngine initialized")

    def analyze(self, audio_base64: str) -> Dict[str, float]:
        """Analyze audio for emotional content using librosa features"""
        try:
            import librosa
            import numpy as np

            audio_bytes = base64.b64decode(audio_base64)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                f.write(audio_bytes)
                temp_path = f.name

            y, sr = librosa.load(temp_path, sr=16000)
            os.unlink(temp_path)

            # Extract features
            rms = float(librosa.feature.rms(y=y).mean())
            zcr = float(librosa.feature.zero_crossing_rate(y).mean())
            spectral_centroid = float(librosa.feature.spectral_centroid(y=y, sr=sr).mean())
            mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            pitch = librosa.yin(y, fmin=60, fmax=500)
            pitch_mean = float(np.nanmean(pitch)) if len(pitch) > 0 else 200
            pitch_std = float(np.nanstd(pitch)) if len(pitch) > 0 else 0

            # Heuristic emotion scoring based on audio features
            # High pitch + high energy + high ZCR = panic/distress
            panic = min(1.0, max(0, (pitch_mean - 250) / 200 + rms * 5 + zcr * 2))
            fear = min(1.0, max(0, (pitch_std / 100) + (zcr - 0.05) * 3))
            distress = min(1.0, max(0, (rms - 0.02) * 10 + (spectral_centroid - 2000) / 3000))
            calm = max(0, 1.0 - (panic + fear + distress) / 3)

            return {
                "panic": round(panic, 3),
                "fear": round(fear, 3),
                "distress": round(distress, 3),
                "calm": round(calm, 3),
                "features": {
                    "rms": round(rms, 4),
                    "zcr": round(zcr, 4),
                    "pitch_mean": round(pitch_mean, 1),
                    "pitch_std": round(pitch_std, 1),
                    "spectral_centroid": round(spectral_centroid, 1),
                }
            }
        except ImportError:
            logger.warning("Librosa not available, using mock scores")
            return self._mock_scores()
        except Exception as e:
            logger.error(f"Emotion analysis error: {e}")
            return self._mock_scores()

    def _mock_scores(self) -> Dict[str, float]:
        return {"panic": 0.1, "fear": 0.1, "distress": 0.15, "calm": 0.65}

    def is_ready(self) -> bool:
        return self._ready
