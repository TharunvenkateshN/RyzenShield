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
            "AWS_KEY": r"(AKIA[0-9A-Za-z]{16,})",
            "TOKEN": r"(?:xox[p|b|o|a]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})", 
            "GITHUB_KEY": r"(ghp_[a-zA-Z0-9]{30,})",
            # Flexible credential assignment (handles 'password is: xxxx', 'password=xxxx', 'Key:', 'Token:', etc.)
            "CREDENTIAL": r"(?i)(?:password|passwd|pwd|secret|key|token)[\s\w]*[:=]+[\s]*([A-Za-z0-9@#$%^&!*_-]{5,})", 
            "BUDGET": r"\$\d+(?:\.\d+)?(?:k|m|b)?\b" # Catch $50k, $1000, etc.
        }
        
        # 2. Institutional/Confidential Keywords
        self.confidential_keywords = [
            "CONFIDENTIAL", "INTERNAL ONLY", "PROPRIETARY", "DRAFT PAPER", 
            "RESEARCH CODE", "DO NOT SHARE", "NDA", "RESTRICTED",
            "PRIVATE KEY", "SECRET KEY" # Added for context
        ]
        
        # 2. SpaCy NER Labels to target
        self.ner_labels = ["PERSON", "ORG", "GPE", "Loc"] 

    def _is_likely_code(self, text: str) -> bool:
        """Heuristic to prevent SpaCy from falsely flagging code syntax as entities."""
        if len(text.strip()) <= 2: 
            return True
        # Contains dots, underscores, parenthesis, brackets, or math symbols
        if re.search(r"[\._\(\)\[\]=+*\-]", text):
            return True
        # Pure lowercase word (likely variables/functions)
        if re.match(r"^[a-z]+$", text):
            return True
        # camelCase or PascalCase without spaces (classes/functions like DataFrame)
        if re.match(r"^[a-z]+[A-Z][a-zA-Z]*$", text) or re.match(r"^[A-Z][a-z]+[A-Z][a-zA-Z]*$", text):
            return True
        return False

    def _deep_context_scan(self, text: str) -> list:
        """
        Simulates an ONNX quantized Small Language Model (SLM) running on the NPU.
        It detects conversational intent of sharing a secret ("my password is...", "the passcode is...")
        which regex and NER cannot catch.
        """
        findings = []
        # Look for intent phrases followed by potential secrets.
        # This handles conversational distance: "password for the bio server is X"
        intent_patterns = [
            r"(?i)(?:secret|passcode|password|code|key|pin)[\s\w]*(?:is|was|to|for|are|be)[\s:]*([a-zA-Z0-9!@#$%^&*()-]{5,})",
            r"(?i)my\s+(?:login|credentials?|password|pass)[\s\w]*(?:are|is)[\s:]*([a-zA-Z0-9!@#$%^&*()-]{5,})",
            r"(?i)(?:don't|do not)\s+share\s+this[\s\w]*(?:is|was)[\s:]*([a-zA-Z0-9!@#$%^&*()-]{5,})",
            r"(?i)log\s*in\s+with\s+([a-zA-Z0-9!@#$%^&*()-]{5,})",
            # Explicit key/value dictionary style bindings common in txt files
            r"(?i)(?:key|token|secret|password|credential)[\s]*:[\s]*([a-zA-Z0-9!@#$%^&*()-]{5,})"
        ]
        
        for pattern in intent_patterns:
            matches = re.finditer(pattern, text)
            for m in matches:
                val = m.group(1)
                # Ignore common stop words that might be accidentally caught
                if val.lower() not in ["the", "a", "an", "this", "that", "it"]:
                    findings.append({
                        "type": "CONTEXT_SECRET",
                        "value": val,
                        "start": m.start(1),
                        "end": m.end(1),
                        "method": "slm_context"
                    })
        return findings

    def scan(self, text: str) -> list:
        """
        Hybrid Scan: Combines Regex (Fast/Rigid) + SpaCy NER (Contextual) + Deep Context Engine.
        Returns unique list of findings.
        """
        findings = []
        seen_values = set()

        # Phase 1: Regex Scan
        for label, pattern in self.regex_patterns.items():
            matches = re.finditer(pattern, text)
            for match in matches:
                # If there are groups (like in CREDENTIAL), extract the group, otherwise entire match
                val = match.group(1) if match.groups() else match.group()
                # Find start and end of the extracted value
                start = match.start(1) if match.groups() else match.start()
                end = match.end(1) if match.groups() else match.end()
                
                if val not in seen_values:
                    findings.append({
                        "type": label,
                        "value": val,
                        "start": start,
                        "end": end,
                        "method": "regex"
                    })
                    seen_values.add(val)

        # Phase 2: SpaCy NER Scan
        if nlp:
            doc = nlp(text)
            for ent in doc.ents:
                if ent.label_ in self.ner_labels:
                    val = ent.text
                    # Avoid duplicates found by Regex and ignore obvious programming code constructs
                    if val not in seen_values and not self._is_likely_code(val):
                        findings.append({
                            "type": ent.label_, # PERSON, ORG, etc.
                            "value": val,
                            "start": ent.start_char,
                            "end": ent.end_char,
                            "method": "ner"
                        })
                        seen_values.add(val)

        # Phase 3: Confidential Keyword Scan
        for kw in self.confidential_keywords:
            # Use word boundaries so "NDA" doesn't catch the "nda" in "pandas"
            pattern = r"\b" + re.escape(kw) + r"\b"
            matches = re.finditer(pattern, text, re.IGNORECASE)
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
                    
        # Phase 4: Deep Context Engine (SLM Simulation)
        contextual_secrets = self._deep_context_scan(text)
        for secret in contextual_secrets:
            if secret["value"] not in seen_values:
                findings.append(secret)
                seen_values.add(secret["value"])
        
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
        if pii_type == "CREDENTIAL": return f"[{prefix}-CREDS-{suffix}]"
        if pii_type == "CONFIDENTIAL": return f"[{prefix}-DATA-{suffix}]"
        if pii_type == "CONTEXT_SECRET": return f"[{prefix}-INTENT-{suffix}]"
        
        return f"[{prefix}-SECRET-{suffix}]"

