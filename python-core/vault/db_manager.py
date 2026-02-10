import sqlite3
# import pysqlcipher3 ... (Using standard sqlite3 for prototype compatibility)

class VaultManager:
    def __init__(self, db_path="vault.db"):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.init_db()

    def init_db(self):
        with open("vault/schema.sql", "r") as f:
            self.cursor.executescript(f.read())
        self.conn.commit()

    def store_mapping(self, real_val, fake_val, pii_type):
        self.cursor.execute(
            "INSERT INTO mappings (real_val, fake_val, type) VALUES (?, ?, ?)",
            (real_val, fake_val, pii_type)
        )
        self.conn.commit()

    def get_real(self, fake_val):
        self.cursor.execute("SELECT real_val FROM mappings WHERE fake_val = ?", (fake_val,))
        res = self.cursor.fetchone()
        return res[0] if res else None
