import json
from mitmproxy import http
import sys
import os

# Ensure we can import from python-core modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from python_core.ai_engine.pii_scanner import PIIScanner
from python_core.ai_engine.inference import AIInferenceEngine
from python_core.vault.db_manager import VaultManager
from python_core.proxy.traffic_parser import parse_chat_request

class RyzenShieldInterceptor:
    def __init__(self):
        print("[RyzenShield] Initializing Components...")
        self.scanner = PIIScanner()
        self.engine = AIInferenceEngine()
        self.engine.load_model()
        self.vault = VaultManager()
        self.session_map = {} # RAM cache: flow_id -> session_id

    def request(self, flow: http.HTTPFlow):
        # Target only AI Chat POST requests
        is_target = flow.request.method == "POST" and (
            "api.openai.com" in flow.request.pretty_host or 
            "claude.ai" in flow.request.pretty_host
        )

        if is_target:
            try:
                # 1. Parse content
                original_body = flow.request.get_text()
                # For prototype, we assume JSON body with a 'messages' field or raw text
                # We need a robust parser, but let's try direct text scan for now if parser fails
                user_text = parse_chat_request(original_body) 
                
                if not user_text:
                    return # Could not extract text

                # 2. PII Scan
                findings = self.scanner.scan(user_text)
                
                if findings:
                    print(f"[RyzenShield] 🛡️ Detected {len(findings)} PII items!")
                    
                    # 3. Create Session & Sanitize
                    session_id = self.vault.create_session()
                    sanitized_text, mapping = self.engine.sanitize(user_text, findings, self.scanner)
                    
                    # 4. Store Mapping
                    self.vault.store_mapping(session_id, mapping)
                    self.session_map[flow.id] = session_id # Link flow to session for response
                    
                    # 5. Modify Request Logic
                    # We need to reconstruct the JSON body with the new text.
                    # This is tricky without a full JSON parser re-builder.
                    # Simple hack: String Replace the snippet in the original body keys
                    # (Risk: might replace non-content fields, but low probability for detailed PII)
                    modified_body = original_body
                    for real, fake in mapping.items():
                        modified_body = modified_body.replace(real, fake)
                    
                    flow.request.set_text(modified_body)
                    
                    # Log event
                    self.vault.log_event("INTERCEPT", f"Sanitized {len(findings)} items in session {session_id}")

            except Exception as e:
                print(f"[RyzenShield] Error in request interception: {e}")

    def response(self, flow: http.HTTPFlow):
        # 6. Restore Real Values in Response
        session_id = self.session_map.get(flow.id)
        if session_id:
            try:
                # Retrieve mapping (Fake -> Real)
                restore_map = self.vault.get_mappings(session_id)
                if not restore_map:
                    return

                response_body = flow.response.get_text()
                
                # Use engine to restore
                restored_body = self.engine.restore(response_body, restore_map)
                
                if response_body != restored_body:
                    print(f"[RyzenShield] 🔄 Restored Real Data for session {session_id}")
                    flow.response.set_text(restored_body)
                    self.vault.log_event("RESTORE", f"Restored data for session {session_id}")
                
                # Cleanup RAM cache
                del self.session_map[flow.id]

            except Exception as e:
                print(f"[RyzenShield] Error in response restoration: {e}")

addons = [RyzenShieldInterceptor()]
