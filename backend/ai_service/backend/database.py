import psycopg2
from psycopg2.extras import RealDictCursor
import os


class Database:
    def __init__(self):
        self.host = os.environ.get('DB_HOST', 'postgres')
        self.port = os.environ.get('DB_PORT', '5432')
        self.dbname = os.environ.get('DB_NAME', 'chatbot_db')
        self.user = os.environ.get('DB_USER', 'BRAHIM')
        self.password = os.environ.get('DB_PASSWORD', '0000')

    def connect(self):
        return psycopg2.connect(
            host=self.host,
            port=self.port,
            dbname=self.dbname,
            user=self.user,
            password=self.password
        )

    def save_message(self, session_id, role, content):
        try:
            conn = self.connect()
            cur = conn.cursor()
            cur.execute(
                """INSERT INTO chat_sessions (session_id)
                   VALUES (%s)
                   ON CONFLICT (session_id) DO UPDATE
                   SET message_count = chat_sessions.message_count + 1,
                       updated_at = CURRENT_TIMESTAMP""",
                (session_id,)
            )
            cur.execute(
                "INSERT INTO messages (session_id, role, content) VALUES (%s, %s, %s)",
                (session_id, role, content)
            )
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            print(f"[DB ERROR] Failed to save message: {e}")

    def get_messages(self, session_id):
        try:
            conn = self.connect()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute(
                "SELECT * FROM messages WHERE session_id = %s ORDER BY timestamp ASC",
                (session_id,)
            )
            rows = cur.fetchall()
            cur.close()
            conn.close()
            return rows
        except Exception as e:
            print(f"[DB ERROR] Failed to get messages: {e}")
            return []

    def get_sessions(self):
        try:
            conn = self.connect()
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT s.session_id, s.created_at, s.message_count,
                       (SELECT content FROM messages m
                        WHERE m.session_id = s.session_id AND m.role = 'user'
                        ORDER BY m.timestamp ASC LIMIT 1) as first_message
                FROM chat_sessions s
                ORDER BY s.updated_at DESC
            """)
            sessions = cur.fetchall()
            cur.close()
            conn.close()

            result = []
            for s in sessions:
                title = s['first_message'][:30] + '...' if s['first_message'] and len(s['first_message']) > 30 else (s['first_message'] or 'New Chat')
                result.append({
                    'session_id': s['session_id'],
                    'title': title,
                    'message_count': s['message_count'],
                    'created_at': s['created_at'].isoformat()
                })
            return result
        except Exception as e:
            print(f"[DB ERROR] Failed to get sessions: {e}")
            return []