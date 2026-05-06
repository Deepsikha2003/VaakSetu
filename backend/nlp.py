"""
VaakSetu — NLP Engine (Claude API)
Intent extraction, entity recognition, dialect-aware summarization
"""
import os, json, logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger("vaaksetu.nlp")

# Intent taxonomy for 1092 calls
INTENT_CATEGORIES = {
    "infrastructure": ["road", "pothole", "water_supply", "electricity", "drainage", "garbage", "street_light"],
    "safety": ["domestic_violence", "assault", "harassment", "stalking", "robbery", "theft"],
    "medical": ["medical_emergency", "ambulance_needed", "hospital_complaint", "health_hazard"],
    "administrative": ["corruption", "bribery", "govt_office_complaint", "document_issue"],
    "environmental": ["noise_pollution", "air_pollution", "illegal_dumping", "tree_falling"],
    "emergency": ["fire", "flood", "building_collapse", "gas_leak", "bomb_threat", "kidnapping"],
}

SUMMARY_PROMPT = """You are VaakSetu, an AI assistant for Karnataka's 1092 helpline.
Analyze this citizen's call transcript and extract:

1. **Intent**: What is the citizen reporting? Category and subcategory.
2. **Entities**: Location, people, organizations, dates, specific items mentioned.
3. **Summary**: A clear 2-3 sentence plain-language summary.
4. **Sentiment**: Overall emotional state (calm/concerned/distressed/panicked).
5. **Urgency**: low/medium/high/critical
6. **Suggested Action**: What should the 1092 agent do next?

Handle dialect variations — the citizen may speak in:
- North Karnataka Kannada (Dharwad/Belgaum style)
- Coastal Karnataka Kannada (Mangalore/Udupi)
- Old Mysore Kannada
- Hyderabad-Karnataka Kannada
- Hindi (with regional variations)
- English (with Indian colloquialisms)
- Code-mixed (Kannada-English, Hindi-English)

Respond in JSON format only:
{
  "intent": {"category": "...", "subcategory": "...", "confidence": 0.0},
  "entities": {"location": "...", "people": [], "organizations": [], "items": []},
  "summary": "...",
  "sentiment": {"overall": "...", "negative": 0.0, "urgency_signals": []},
  "urgency": "...",
  "suggested_action": "...",
  "dialect_zone": "..."
}

Transcript: """

VERIFICATION_PROMPT = """Based on this analysis, generate a confirmation sentence that VaakSetu will speak back to the citizen in their own language ({language}).

The sentence should be: "I understand you are reporting [X] at [Y]. Is that correct?"

Analysis: {analysis}

Generate ONLY the confirmation sentence in {language}. Nothing else."""


class NLPEngine:
    def __init__(self):
        self._ready = True
        self.api_key = os.getenv("ANTHROPIC_API_KEY", "")
        self.client = None
        if self.api_key and self.api_key != "sk-ant-your-key-here":
            try:
                import anthropic
                self.client = anthropic.Anthropic(api_key=self.api_key)
                logger.info("NLPEngine: Claude API connected")
            except Exception as e:
                logger.warning(f"Claude API not available: {e}")
        else:
            logger.info("NLPEngine: Running in mock mode (no API key)")

    async def process(self, text: str, language: str = "auto", dialect_zone: str = "general") -> Dict[str, Any]:
        """Process transcript through Claude for intent/entity/summary extraction"""
        if self.client:
            try:
                response = self.client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=1024,
                    messages=[{"role": "user", "content": SUMMARY_PROMPT + text}]
                )
                content = response.content[0].text
                # Try to parse JSON from response
                try:
                    if "```json" in content:
                        content = content.split("```json")[1].split("```")[0]
                    elif "```" in content:
                        content = content.split("```")[1].split("```")[0]
                    return json.loads(content.strip())
                except json.JSONDecodeError:
                    return self._build_result(text, language, raw_response=content)
            except Exception as e:
                logger.error(f"Claude API error: {e}")
                return self._mock_process(text, language, dialect_zone)
        else:
            return self._mock_process(text, language, dialect_zone)

    async def generate_verification(self, analysis: Dict, language: str) -> str:
        """Generate verification sentence for citizen confirmation"""
        if self.client:
            try:
                prompt = VERIFICATION_PROMPT.format(language=language, analysis=json.dumps(analysis))
                response = self.client.messages.create(
                    model="claude-sonnet-4-20250514",
                    max_tokens=256,
                    messages=[{"role": "user", "content": prompt}]
                )
                return response.content[0].text.strip()
            except Exception as e:
                logger.error(f"Verification generation error: {e}")
        
        summary = analysis.get("summary", "your issue")
        location = analysis.get("entities", {}).get("location", "your area")
        return f"I understand you are reporting {summary} at {location}. Is that correct?"

    def _mock_process(self, text: str, language: str, dialect_zone: str = "general") -> Dict[str, Any]:
        """Enhanced mock NLP when Claude API is not available"""
        text_lower = text.lower()
        
        # Intent detection with comprehensive word lists
        category = "general"
        subcategory = "complaint"
        urgency = "low"
        sentiment_neg = 0.2
        urgency_signals = []

        # Emergency / Tier 1 patterns
        emergency_words = [
            # English
            "help", "help me", "save", "save me", "dying", "die", "dead", "death",
            "kill", "killing", "murder", "stab", "fire", "blood", "bomb", "gun",
            "shoot", "shooting", "hostage", "suicide",
            # Hindi romanized
            "bachao", "bachaao", "bachaw", "bachav", "bacho",
            "maar", "maarna", "maar raha", "maar daalega", "maar dalega",
            "madad", "madad karo", "sahaya", "sahayata", "help karo",
            "jaan", "jaan se", "khoon", "chaku", "goli", "bandook",
            "marna", "mar jaunga", "mar jaungi",
            # Hindi Devanagari
            "बचाओ", "मार", "मारना", "खून", "मदद", "सहायता", "जान",
            # Kannada
            "ಸಹಾಯ", "ಕೊಲ್ಲು", "ಬಚಾವ್", "ಬೆಂಕಿ", "ರಕ್ತ",
        ]
        
        safety_words = [
            "violence", "domestic violence", "assault", "harass", "abuse",
            "maar raha hai", "maar rahi hai", "maar peet", "maarpeet",
            "dhamki", "darr", "dar", "ladai",
            "ದೌರ್ಜನ್ಯ", "ಬೆದರಿಕೆ",
            "ज़ुल्म", "धमकी", "डर", "हमला",
        ]
        
        infra_words = [
            "road", "pothole", "water", "electricity", "garbage", "drain",
            "sadak", "bijli", "pani", "safai",
            "ರಸ್ತೆ", "ಗುಂಡಿ", "ನೀರು", "ಕರೆಂಟ್", "ಕಸ",
        ]

        medical_words = [
            "hospital", "ambulance", "doctor", "injury", "injured", "hurt",
            "accident", "crash", "bleeding",
            "ಆಸ್ಪತ್ರೆ", "ಆಂಬುಲೆನ್ಸ್", "ಗಾಯ", "ಅಪಘಾತ",
        ]

        # Count matches for scoring
        emergency_count = sum(1 for w in emergency_words if w in text_lower)
        safety_count = sum(1 for w in safety_words if w in text_lower)
        medical_count = sum(1 for w in medical_words if w in text_lower)
        infra_count = sum(1 for w in infra_words if w in text_lower)

        if emergency_count >= 2:
            category = "emergency"
            subcategory = "immediate_danger"
            urgency = "critical"
            sentiment_neg = 0.95
            urgency_signals = ["multiple_emergency_keywords", "immediate_threat"]
        elif emergency_count == 1:
            category = "emergency"
            subcategory = "danger_reported"
            urgency = "critical"
            sentiment_neg = 0.85
            urgency_signals = ["emergency_keyword_detected"]
        elif safety_count > 0:
            category = "safety"
            subcategory = "violence_reported"
            urgency = "high"
            sentiment_neg = 0.75
            urgency_signals = ["safety_concern"]
        elif medical_count > 0:
            category = "medical"
            subcategory = "medical_emergency"
            urgency = "high"
            sentiment_neg = 0.6
            urgency_signals = ["medical_attention_needed"]
        elif infra_count > 0:
            category = "infrastructure"
            subcategory = "civic_issue"
            urgency = "medium"
            sentiment_neg = 0.3

        # Generate appropriate summary
        if category == "emergency":
            summary = f"EMERGENCY: Citizen reporting immediate danger — {text[:120]}"
        elif category == "safety":
            summary = f"SAFETY ALERT: Citizen reporting violence/threat — {text[:120]}"
        elif category == "medical":
            summary = f"MEDICAL: Citizen reporting medical emergency — {text[:120]}"
        else:
            summary = f"Citizen reporting {category} issue: {text[:120]}"

        return {
            "intent": {"category": category, "subcategory": subcategory, "confidence": 0.75 + (emergency_count * 0.05)},
            "entities": {"location": "Bengaluru", "people": [], "organizations": ["BBMP"], "items": []},
            "summary": summary,
            "sentiment": {"overall": "panicked" if urgency == "critical" else "concerned",
                          "negative": sentiment_neg, "urgency_signals": urgency_signals},
            "urgency": urgency,
            "suggested_action": f"Route to {category} department for immediate attention",
            "dialect_zone": dialect_zone if dialect_zone != "general" else ("karnataka" if language == "kn" else "general"),
        }

    def _build_result(self, text: str, language: str, raw_response: str = "") -> Dict:
        result = self._mock_process(text, language)
        result["raw_ai_response"] = raw_response
        return result

    def is_ready(self) -> bool:
        return self._ready
