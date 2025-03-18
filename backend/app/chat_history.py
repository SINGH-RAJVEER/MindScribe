from app.database import cursor, conn
from uuid import uuid4

def store_chat(user_id, conversation_id, user_message, bot_response, mood=None, is_crisis=False):
    message_id = str(uuid4())
    cursor.execute(
        """
        INSERT INTO messages (id,user_id, conversation_id, user_message, bot_response, mood, is_crisis, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        """,
        (message_id,user_id, conversation_id, user_message, bot_response, mood, is_crisis),
    )
    conn.commit()


def get_chat_history(user_id, limit=10):
    cursor.execute("""
        SELECT conversation_id, user_message, bot_response, mood,is_crisis ,timestamp 
        FROM messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?
    """, (user_id, limit))
    return cursor.fetchall()

def create_new_conversation(user_id, conversation_id):
    cursor.execute("""
        INSERT INTO conversations (id, user_id) 
        VALUES (?, ?)
    """, (conversation_id, user_id))
    conn.commit()