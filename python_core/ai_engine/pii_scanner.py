import re
import spacy
import sys

# Try loading spaCy model, fallback if not installed/downloaded
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("[PII Scanner] SpaCy model 'en_core_web_sm' not found. Downloads needed.")
    print("Run: python -m spacy download en_core_web_sm")
    nlp = None

class PIIScanner:
    def __init__(self):
        # 1. Regex Patterns for Rigid PII
        self.regex_patterns = {
            "EMAIL": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            "PHONE": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
            "API_KEY": r"(sk-[a-zA-Z0-9]{32,})",
            "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
            "IPV4": r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b"
        }
        
        # 2. SpaCy NER Labels to target
        self.ner_labels = ["PERSON", "ORG", "GPE", "Loc"] 

    def scan(self, text: str) -> list:
        """
        Hybrid Scan: Combines Regex (Fast/Rigid) + SpaCy NER (Contextual).
        Returns unique list of findings.
        """
        findings = []
        seen_values = set()

        # Phase 1: Regex Scan
        for label, pattern in self.regex_patterns.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                val = match.group()
                if val not in seen_values:
                    findings.append({
                        "type": label,
                        "value": val,
                        "start": match.start(),
                        "end": match.end(),
                        "method": "regex"
                    })
                    seen_values.add(val)

        # Phase 2: SpaCy NER Scan
        if nlp:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ in self.ner_labels:
                    # Avoid duplicates found by Regex (e.g. Org names that look like emails?)
                    if ent.text not in seen_values:
                        findings.append({
                            "type": ent.label_, # PERSON, ORG, etc.
                            "value": ent.text,
                            "start": ent.start_char,
                            "end": ent.end_char,
                            "method": "ner"
                        })
                        seen_values.add(ent.text)
        
        return findings

    def generate_fake(self, pii_type: str, original_value: str = "") -> str:
        """
        Generates context-aware fake values using a localized list.
        """
        if pii_type == "EMAIL": return "user_privacy@example.com"
        if pii_type == "PHONE": return "555-0199"
        if pii_type == "API_KEY": return "sk-proj-RyzenShield-Protected"
        if pii_type == "PERSON": return "Jane Doe"
        if pii_type == "ORG": return "Acme Corp"
        if pii_type == "GPE": return "Metropolis"
        return "[REDACTED]"
