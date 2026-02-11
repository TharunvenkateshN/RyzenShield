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
