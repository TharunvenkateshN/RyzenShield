from fastapi import APIRouter
from python_core.vault.db_manager import VaultManager

router = APIRouter()
vault = VaultManager()

@router.get("/")
async def root():
    return {"status": "RyzenShield Sentinel Active", "device": "AMD Ryzen AI"}

@router.get("/stats")
async def get_stats():
    # TODO: Fetch real stats from DB
    return {
        "threats_blocked": 12, # Placeholder -> Query DB
        "pii_masked": 45,      # Placeholder
        "latency_saved_ms": 1200
    }

@router.get("/logs")
async def get_logs():
    """Returns the latest 50 logs from the Vault."""
    try:
        logs = vault.get_recent_logs(limit=50)
        return logs
    except Exception as e:
        return [{"message": f"Error fetching logs: {e}", "event_type": "ERROR"}]

from python_core.ai_engine.pii_scanner import PIIScanner
from python_core.ai_engine.inference import AIInferenceEngine

scanner = PIIScanner()
inference = AIInferenceEngine()

import json
import uuid

@router.post("/process_text")
async def process_text_api(payload: dict):
    """
    Scans text for PII. If it detects JSON (ChatGPT payload), it scans
    the values specifically to prevent breaking the JSON structure.
    """
    try:
        original_text = payload.get("text", "")
        
        # Check if the text is actually a JSON object (common in intercepted fetches)
        is_json = False
        try:
            data = json.loads(original_text)
            is_json = True
        except:
            pass

        if is_json:
            # Targeted Scanning for ChatGPT: ONLY scan the 'parts' field.
            # This prevents us from breaking IDs, timezones, and protocol fields.
            modified = False
            all_findings = []
            
            def targeted_scan(obj):
                nonlocal modified
                if isinstance(obj, dict):
                    for k, v in obj.items():
                        # ChatGPT message content is always in a field called 'parts'
                        if k == 'parts' and isinstance(v, list):
                            for i in range(len(v)):
                                if isinstance(v[i], str):
                                    findings = scanner.scan(v[i])
                                    if findings:
                                        sanitized, mapping = inference.sanitize(v[i], findings, scanner)
                                        v[i] = sanitized
                                        all_findings.extend(findings)
                                        modified = True
                        elif isinstance(v, (dict, list)):
                            targeted_scan(v)
                elif isinstance(obj, list):
                    for item in obj:
                        targeted_scan(item)
            
            targeted_scan(data)
            
            if modified:
                session_id = str(uuid.uuid4())
                print(f"[Sentinel] Sanitized ChatGPT Payload: {len(all_findings)} items")
                vault.log_event("INTERCEPT", f"Sanitized {len(all_findings)} items in Chat Content")
                # Return the modified JSON
                return {"text": json.dumps(data), "sanitized": True}
            return {"text": original_text, "sanitized": False}

        # Fallback to raw text scanning (for non-JSON strings)
        findings = scanner.scan(original_text)
        if findings:
            sanitized_text, mapping = inference.sanitize(original_text, findings, scanner)
            session_id = str(uuid.uuid4())
            print(f"[Sentinel] Sanitized Raw Text: {len(findings)} items")
            vault.log_event("INTERCEPT", f"Sanitized {len(findings)} items in Raw Text")
            return {"text": sanitized_text, "sanitized": True}
        
        return {"text": original_text, "sanitized": False}
    except Exception as e:
        print(f"[Sentinel] ERROR in process_text: {e}")
        import traceback
        traceback.print_exc()
        return {"text": payload.get("text", ""), "sanitized": False, "error": str(e)}
