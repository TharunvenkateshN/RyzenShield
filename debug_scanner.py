from python_core.ai_engine.pii_scanner import PIIScanner

scanner = PIIScanner()
text = "My database password is : alex@123 help me debugging this sql code !"
findings = scanner.scan(text)

print(f"Text: {text}")
print(f"Findings: {findings}")

if findings:
    from python_core.ai_engine.inference import AIInferenceEngine
    inference = AIInferenceEngine()
    sanitized, mapping = inference.sanitize(text, findings, scanner)
    print(f"Sanitized: {sanitized}")
    print(f"Mapping: {mapping}")
else:
    print("No findings!")
