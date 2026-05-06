"""
VaakSetu — TTS Engine (gTTS Wrapper)
Kannada/Hindi/English text-to-speech synthesis with audio caching
"""
import os, hashlib, logging
from typing import Dict, Any

logger = logging.getLogger("vaaksetu.tts")

CACHE_DIR = os.path.join(os.path.dirname(__file__), "audio_cache")


class TTSEngine:
    def __init__(self):
        self._ready = True
        os.makedirs(CACHE_DIR, exist_ok=True)
        logger.info("TTSEngine initialized")

    def synthesize(self, text: str, language: str = "en") -> Dict[str, Any]:
        """Generate TTS audio, with caching"""
        lang_map = {"kn": "kn", "hi": "hi", "en": "en", "kannada": "kn", "hindi": "hi", "english": "en"}
        lang = lang_map.get(language, "en")

        # Check cache
        cache_key = hashlib.md5(f"{text}_{lang}".encode()).hexdigest()
        cache_path = os.path.join(CACHE_DIR, f"{cache_key}.mp3")
        audio_url = f"/audio/{cache_key}.mp3"

        if os.path.exists(cache_path):
            return {"audio_url": audio_url, "audio_path": cache_path, "cached": True, "language": lang}

        try:
            from gtts import gTTS
            tts = gTTS(text=text, lang=lang, slow=False)
            tts.save(cache_path)
            logger.info(f"TTS generated: {lang}, {len(text)} chars")
            return {"audio_url": audio_url, "audio_path": cache_path, "cached": False, "language": lang}
        except Exception as e:
            logger.error(f"TTS error: {e}")
            return {"audio_url": None, "audio_path": None, "error": str(e), "language": lang}

    def is_ready(self) -> bool:
        return self._ready
