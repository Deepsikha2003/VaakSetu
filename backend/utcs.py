"""
VaakSetu — Unified Threat Confidence Score (UTCS) Engine
Weighted formula combining keyword hits, NLP sentiment, emotion, and noise analysis
"""
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("vaaksetu.utcs")

# UTCS Levels with colour codes for dashboard
UTCS_LEVELS = {
    "CRITICAL": {"min": 500, "color": "#FF0000", "action": "IMMEDIATE_TAKEOVER"},
    "HIGH":     {"min": 350, "color": "#FF6600", "action": "SUPERVISOR_ALERT"},
    "MEDIUM":   {"min": 200, "color": "#FFD700", "action": "PRIORITY_QUEUE"},
    "LOW":      {"min": 50,  "color": "#00CC66", "action": "NORMAL_PROCESSING"},
    "MINIMAL":  {"min": 0,   "color": "#00AAFF", "action": "ROUTINE"},
}

# Weights for UTCS calculation
WEIGHTS = {
    "keyword_tier1": 200,  # Per tier-1 keyword hit
    "keyword_tier2": 75,   # Per tier-2 keyword hit
    "keyword_tier3": 15,   # Per tier-3 keyword hit
    "nlp_sentiment_negative": 100,  # Negative sentiment multiplier
    "nlp_intent_emergency": 150,    # Emergency intent detected
    "emotion_panic": 120,    # Panic score multiplier
    "emotion_fear": 80,      # Fear score multiplier
    "emotion_distress": 60,  # Distress score multiplier
    "noise_screaming": 150,  # Screaming/shouting background
    "noise_struggle": 120,   # Sounds of struggle
    "noise_crying": 70,      # Crying detected
}


class UTCSEngine:
    def __init__(self):
        self._ready = True
        self._call_scores = {}  # In-memory cache of per-call UTCS
        logger.info("UTCSEngine initialized")

    def calculate(self, keyword_hits: Dict, nlp_result: Dict,
                  emotion_scores: Dict, noise_analysis: Optional[Dict] = None) -> Dict[str, Any]:
        score = 0.0
        breakdown = {}

        # 1. Keyword scoring (25% weight)
        kw_score = 0
        tc = keyword_hits.get("tier_counts", {})
        kw_score += tc.get(1, 0) * WEIGHTS["keyword_tier1"]
        kw_score += tc.get(2, 0) * WEIGHTS["keyword_tier2"]
        kw_score += tc.get(3, 0) * WEIGHTS["keyword_tier3"]
        breakdown["keywords"] = kw_score
        score += kw_score

        # 2. NLP/Sentiment scoring (15%)
        nlp_score = 0
        sentiment = nlp_result.get("sentiment", {})
        if isinstance(sentiment, dict):
            neg = sentiment.get("negative", 0)
        else:
            neg = 0.3 if sentiment in ["negative", "distress"] else 0
        nlp_score += neg * WEIGHTS["nlp_sentiment_negative"]
        
        intent = nlp_result.get("intent", {})
        if isinstance(intent, dict):
            cat = intent.get("category", "")
        else:
            cat = str(intent)
        if any(e in cat.lower() for e in ["emergency", "danger", "violence", "medical"]):
            nlp_score += WEIGHTS["nlp_intent_emergency"]
        breakdown["nlp"] = nlp_score
        score += nlp_score

        # 3. Emotion scoring (20%)
        emo_score = 0
        emo_score += emotion_scores.get("panic", 0) * WEIGHTS["emotion_panic"]
        emo_score += emotion_scores.get("fear", 0) * WEIGHTS["emotion_fear"]
        emo_score += emotion_scores.get("distress", 0) * WEIGHTS["emotion_distress"]
        breakdown["emotion"] = round(emo_score, 1)
        score += emo_score

        # 4. Noise scoring (20%)
        noise_score = 0
        if noise_analysis:
            noise_score += noise_analysis.get("screaming", 0) * WEIGHTS["noise_screaming"]
            noise_score += noise_analysis.get("struggle", 0) * WEIGHTS["noise_struggle"]
            noise_score += noise_analysis.get("crying", 0) * WEIGHTS["noise_crying"]
        breakdown["noise"] = round(noise_score, 1)
        score += noise_score

        score = round(score, 1)
        level = self._get_level(score)

        return {
            "score": score,
            "level": level,
            "color": UTCS_LEVELS[level]["color"],
            "action": UTCS_LEVELS[level]["action"],
            "breakdown": breakdown,
        }

    def update_with_noise(self, call_id: str, noise_result: Dict) -> Dict[str, Any]:
        """Update an existing UTCS score with new noise data"""
        cached = self._call_scores.get(call_id, {"score": 0, "breakdown": {}})
        noise_score = 0
        noise_score += noise_result.get("screaming", 0) * WEIGHTS["noise_screaming"]
        noise_score += noise_result.get("struggle", 0) * WEIGHTS["noise_struggle"]
        noise_score += noise_result.get("crying", 0) * WEIGHTS["noise_crying"]

        new_score = cached["score"] + noise_score
        level = self._get_level(new_score)
        result = {
            "score": round(new_score, 1),
            "level": level,
            "color": UTCS_LEVELS[level]["color"],
            "action": UTCS_LEVELS[level]["action"],
            "breakdown": {**cached.get("breakdown", {}), "noise": round(noise_score, 1)},
        }
        self._call_scores[call_id] = result
        return result

    def _get_level(self, score: float) -> str:
        for level, config in UTCS_LEVELS.items():
            if score >= config["min"]:
                return level
        return "MINIMAL"

    def is_ready(self) -> bool:
        return self._ready
