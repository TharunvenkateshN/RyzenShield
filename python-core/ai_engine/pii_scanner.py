import re

class PIIScanner:
    def __init__(self):
        # Basic regex for PII (can be enhanced with Presidio)
        self.patterns = {
            "EMAIL": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
            "PHONE": r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b",
            "API_KEY": r"(sk-[a-zA-Z0-9]{32,})"
        }

    def scan(self, text: str) -> list:
        """Returns a list of detected PII entities."""
        findings = []
        for label, pattern in self.patterns.items():
            matches = re.findall(pattern, text)
            for match in matches:
                findings.append({"type": label, "value": match})
        return findings

    def generate_fake(self, pii_type: str) -> str:
        """Generates a fake value for a given PII type."""
        if pii_type == "EMAIL": return "jane.doe@example.com"
        if pii_type == "PHONE": return "555-0199"
        if pii_type == "API_KEY": return "sk-fake-key-12345"
        return "[REDACTED]"
