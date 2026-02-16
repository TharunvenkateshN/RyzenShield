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
            "PHONE": r"\b(?:\+?\d{1,3}[-. ]?)?\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}\b",
            "API_KEY": r"(sk-[a-zA-Z0-9\-]{8,})", # Relaxed and hyphen-capable for demo/test keys
            "SSN": r"\b\d{3}-\d{2}-\d{4}\b",
            "IPV4": r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b",
            "AWS_KEY": r"(AKIA[0-9A-Z]{16})",
            "TOKEN": r"(?:xox[p|b|o|a]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})", 
            "GITHUB_KEY": r"(ghp_[a-zA-Z0-9]{36})",
            "BUDGET": r"\$\d+(?:\.\d+)?(?:k|m|b)?\b" # Catch $50k, $1000, etc.
        }
        
        # 2. Institutional/Confidential Keywords
        self.confidential_keywords = [
            "CONFIDENTIAL", "INTERNAL ONLY", "PROPRIETARY", "DRAFT PAPER", 
            "RESEARCH CODE", "DO NOT SHARE", "NDA", "RESTRICTED", "PASSWORD:",
            "PRIVATE KEY", "SECRET KEY" # Added for context
        ]
        
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

        # Phase 3: Confidential Keyword Scan
        for kw in self.confidential_keywords:
            if kw.upper() in text.upper():
                # Find all occurrences
                matches = re.finditer(re.escape(kw), text, re.IGNORECASE)
                for m in matches:
                    val = m.group()
                    if val not in seen_values:
                        findings.append({
                            "type": "CONFIDENTIAL",
                            "value": val,
                            "start": m.start(),
                            "end": m.end(),
                            "method": "keyword"
                        })
                        seen_values.add(val)
        
        return findings

    def generate_fake(self, pii_type: str, original_value: str = "", count: int = 1) -> str:
        """
        Generates unique hardware-managed Shadow Tokens for Zero-Knowledge interaction.
        """
        prefix = "RS" # Ryzen Shield
        suffix = f"{count:02d}"
        
        if pii_type == "EMAIL": return f"[{prefix}-MAIL-{suffix}]"
        if pii_type == "PHONE": return f"[{prefix}-PHONE-{suffix}]"
        if pii_type == "API_KEY": return f"[{prefix}-KEY-{suffix}]"
        if pii_type == "PERSON": return f"[{prefix}-USER-{suffix}]"
        if pii_type == "ORG": return f"[{prefix}-ORG-{suffix}]"
        if pii_type == "GPE": return f"[{prefix}-LOC-{suffix}]"
        if pii_type == "CONFIDENTIAL": return f"[{prefix}-DATA-{suffix}]"
        
        return f"[{prefix}-SECRET-{suffix}]"
