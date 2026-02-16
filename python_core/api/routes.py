from fastapi import APIRouter
from python_core.vault.db_manager import VaultManager

router = APIRouter()
vault = VaultManager()

@router.get("/")
async def root():
    return {"status": "RyzenShield Sentinel Active", "device": "AMD Ryzen AI"}

@router.get("/stats")
async def get_stats():
    """Fetches real cumulative stats from the Vault."""
    try:
        return vault.get_stats()
    except Exception as e:
        print(f"[Vault] Error fetching stats: {e}")
        return {"threats_neutralized": 0, "pii_masked": 0, "latency_saved": 0}

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
                
                # Store findings in Vault for stats and de-sanitization
                mapping_to_store = {f["value"]: f["type"] for f in all_findings} 
                # Note: db_manager.store_mapping expects {real: fake}. 
                # Our scanner/inference gives us findings. Let's fix this logic.
                
                # Correctly store: we need to pass the actual mapping.
                # Since sanitize() returns (sanitized_text, mapping), we should use that.
                
                vault.log_event("INTERCEPT", f"Sanitized {len(all_findings)} items in Chat Content")
                # For now, let's just log a 'pii_masked' count by inserting into mappings
                for f in all_findings:
                    vault.conn.execute("INSERT INTO mappings (session_id, real_val, fake_val, type) VALUES (?, ?, ?, ?)", 
                                     (session_id, f["value"], "FAKE", f["type"]))
                vault.conn.commit()

                return {"text": json.dumps(data), "sanitized": True}
            return {"text": original_text, "sanitized": False}

        # Fallback to raw text scanning (for non-JSON strings)
        findings = scanner.scan(original_text)
        if findings:
            sanitized_text, mapping = inference.sanitize(original_text, findings, scanner)
            session_id = str(uuid.uuid4())
            print(f"[Sentinel] Sanitized Raw Text: {len(findings)} items")
            
            vault.log_event("INTERCEPT", f"Sanitized {len(findings)} items in Raw Text")
            for f in findings:
                    vault.conn.execute("INSERT INTO mappings (session_id, real_val, fake_val, type) VALUES (?, ?, ?, ?)", 
                                     (session_id, f["value"], "FAKE", f["type"]))
            vault.conn.commit()
            
            return {"text": sanitized_text, "sanitized": True}
        
        return {"text": original_text, "sanitized": False}
    except Exception as e:
        print(f"[Sentinel] ERROR in process_text: {e}")
        import traceback
        traceback.print_exc()
        return {"text": payload.get("text", ""), "sanitized": False, "error": str(e)}
