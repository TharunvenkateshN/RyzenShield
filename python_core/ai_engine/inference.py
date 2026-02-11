import onnxruntime as ort
import numpy as np
import os

class AIInferenceEngine:
    def __init__(self, model_path="models/phi3.onnx"):
        self.model_path = model_path
        self.session = None

    def load_model(self):
        """Loads the ONNX model with Vitis AI EP if available."""
        providers = ['CPUExecutionProvider']
        # Check for Vitis AI / DirectML support later
        try:
            # self.session = ort.InferenceSession(self.model_path, providers=providers)
            print(f"[AI Engine] Model loaded (Simulated) from {self.model_path}")
        except Exception as e:
            print(f"[AI Engine] Error loading model: {e}")

    def sanitize(self, text: str, pii_findings: list, scanner) -> tuple[str, dict]:
        """
        Replaces PII with consistent fake values.
        Returns: (sanitized_text, mapping_dict)
        """
        mapping = {}
        # Sort findings by start position in reverse order to replace without offsetting indices
        sorted_findings = sorted(pii_findings, key=lambda x: x['start'], reverse=True)
        
        sanitized_text = list(text)

        for finding in sorted_findings:
            real_val = finding['value']
            pii_type = finding['type']
            
            # Ensure consistent replacement (Tharun -> Person_1 every time)
            if real_val not in mapping:
                fake_val = scanner.generate_fake(pii_type, real_val)
                # If multiple same types, append index? For now, simple mapping.
                mapping[real_val] = fake_val
            else:
                fake_val = mapping[real_val]

            # Perform replacement in the mutable list
            start, end = finding['start'], finding['end']
            sanitized_text[start:end] = list(fake_val)

        return "".join(sanitized_text), mapping

    def restore(self, text: str, mapping: dict) -> str:
        """
        Restores the real values from the fake ones.
        """
        restored_text = text
        for real, fake in mapping.items():
            restored_text = restored_text.replace(fake, real)
        return restored_text
