import sqlite3
import os
import uuid

# Define DB path relative to this file
DB_PATH = os.path.join(os.path.dirname(__file__), "vault.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

class VaultManager:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.init_db()

    def init_db(self):
        with open(SCHEMA_PATH, "r") as f:
            self.conn.executescript(f.read())
        self.conn.commit()

    def create_session(self) -> str:
        """Creates a new session for a chat interaction."""
        session_id = str(uuid.uuid4())
        # In a real app, we'd log the session creation here
        return session_id

    def store_mapping(self, session_id: str, mapping: dict):
        """
        Stores the PII mapping for a specific session.
        mapping: { 'real_val': 'fake_val' }
        """
        cursor = self.conn.cursor()
        for real, fake in mapping.items():
            # Check if exists to avoid duplicates per session? 
            # Simplified: Just insert.
            cursor.execute(
                "INSERT INTO mappings (session_id, real_val, fake_val, type) VALUES (?, ?, ?, ?)",
                (session_id, real, fake, "PII")
            )
        self.conn.commit()
        print(f"[Vault] Stored {len(mapping)} mappings for session {session_id}")

    def get_mappings(self, session_id: str) -> dict:
        """
        Retrieves the mapping dictionary for a session.
        Returns: { 'fake_val': 'real_val' } (Reversed for restoration)
        """
        cursor = self.conn.cursor()
        cursor.execute("SELECT real_val, fake_val FROM mappings WHERE session_id = ?", (session_id,))
        rows = cursor.fetchall()
        
        # Return reversed map for restoration (Fake -> Real)
        return {row["fake_val"]: row["real_val"] for row in rows}

    def log_event(self, event_type, message):
        self.conn.execute("INSERT INTO logs (event_type, message) VALUES (?, ?)", (event_type, message))
        self.conn.commit()

    def get_recent_logs(self, limit=20):
        """Fetches the latest logs for the dashboard."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT event_type, message, timestamp FROM logs ORDER BY id DESC LIMIT ?", (limit,))
        return [dict(row) for row in cursor.fetchall()]

    def get_stats(self):
        """Calculates cumulative stats for the dashboard."""
        try:
            cursor = self.conn.cursor()
            
            # 1. Threats Neutralized (Count of INTERCEPT events)
            cursor.execute("SELECT COUNT(*) FROM logs WHERE event_type = 'INTERCEPT'")
            row = cursor.fetchone()
            threats_neutralized = row[0] if row else 0
            
            # 2. PII Elements Masked (Count of all mappings)
            cursor.execute("SELECT COUNT(*) FROM mappings")
            row = cursor.fetchone()
            pii_masked = row[0] if row else 0
            
            # 3. Latency Saved (Simulated: 45ms per block + 20ms per log)
            latency_saved = (threats_neutralized * 45) + (pii_masked * 15)

            # 4. Digital Hygiene Score (Gamification)
            hygiene_score = min(999, 500 + (threats_neutralized * 25) + (pii_masked * 10))
            
            # Determine Grade
            grade = "B"
            if hygiene_score > 900: grade = "S"
            elif hygiene_score > 800: grade = "A+"
            elif hygiene_score > 700: grade = "A"
            elif hygiene_score > 600: grade = "B+"
            
            return {
                "threats_neutralized": threats_neutralized,
                "pii_masked": pii_masked,
                "latency_saved": latency_saved,
                "hygiene_score": hygiene_score,
                "hygiene_grade": grade
            }
        except Exception as e:
            print(f"[Vault] get_stats error: {e}")
            return {
                "threats_neutralized": 0,
                "pii_masked": 0,
                "latency_saved": 0,
                "hygiene_score": 500,
                "hygiene_grade": "B"
            }

    def get_all_mappings(self, limit=100):
        """Fetches all stored PII mappings."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT id, session_id, real_val, fake_val, type, created_at FROM mappings ORDER BY id DESC LIMIT ?", (limit,))
        return [dict(row) for row in cursor.fetchall()]

    def get_real_value(self, mapping_id: int):
        """Retrieves the original value for a specific mapping."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT real_val FROM mappings WHERE id = ?", (mapping_id,))
        row = cursor.fetchone()
        return row["real_val"] if row else None

    def get_real_by_fake(self, fake_val: str):
        """Retrieves the real value given its shadow token."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT real_val FROM mappings WHERE fake_val = ? ORDER BY id DESC LIMIT 1", (fake_val,))
        row = cursor.fetchone()
        return row["real_val"] if row else None
