from datetime import datetime
from extensions import db
from database.models import ChatSession, Message, Image


# messages

def save_message(session_id: str, role: str, content: str, user_id: str = None):
    try:
        session = ChatSession.query.get(session_id)
        if not session:
            session = ChatSession(session_id=session_id, user_id=user_id)
            db.session.add(session)

        db.session.add(Message(session_id=session_id, role=role, content=content))
        session.message_count = (session.message_count or 0) + 1
        session.updated_at = datetime.utcnow()
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        print(f"[DB ERROR] save_message: {e}")







def get_messages(session_id: str) -> list:
    try:
        rows = (
            Message.query
            .filter_by(session_id=session_id)
            .order_by(Message.timestamp.asc())
            .all()
        )
        print(f"[DB] Loaded {len(rows)} messages for session {session_id}")
        return [
            {"role": m.role, "content": m.content, "timestamp": m.timestamp.isoformat()}
            for m in rows
        ]
    except Exception as e:
        print(f"[DB ERROR] get_messages: {e}")
        return []
    



# # sessions

def get_sessions(user_id: str = None) -> list:
    try:
        query = ChatSession.query.order_by(ChatSession.updated_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)

        result = []
        for s in query.all():
            if s.title:
                title = s.title
            else:
                first_msg = (
                    Message.query
                    .filter_by(session_id=s.session_id, role='user')
                    .order_by(Message.timestamp.asc())
                    .first()
                )
                if first_msg:
                    title = first_msg.content[:30] + ('...' if len(first_msg.content) > 30 else '')
                else:
                    title = 'New chat'

            result.append({
                'session_id':    s.session_id,
                'title':         title,
                'message_count': s.message_count,
                'created_at':    s.created_at.isoformat(),
            })
        return result
    except Exception as e:
        print(f"[DB ERROR] get_sessions: {e}")
        return []





def update_session_title(session_id: str, title: str):
    try:
        session = ChatSession.query.get(session_id)
        if session:
            session.title = title
            session.updated_at = datetime.utcnow()
            db.session.commit()
            print(f"[DB] Title updated for session {session_id}: {title}")
        else:
            print(f"[DB] Session {session_id} not found")
    except Exception as e:
        db.session.rollback()
        print(f"[DB ERROR] update_session_title: {e}")




# images

def save_image(prompt: str, filename: str, url: str,
               model_used: str = None, session_id: str = None, user_id: str = None):
    try:
        db.session.add(Image(
            prompt=prompt,
            filename=filename,
            url=url,
            model_used=model_used,
            session_id=session_id,
            user_id=user_id,
        ))
        db.session.commit()
        print(f"[DB] Image saved: {filename}")
    except Exception as e:
        db.session.rollback()
        print(f"[DB ERROR] save_image: {e}")


def get_images(user_id: str = None, session_id: str = None) -> list:
    try:
        query = Image.query.order_by(Image.created_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)
        elif session_id:
            query = query.filter_by(session_id=session_id)
        return [
            {
                'url':        img.url,
                'prompt':     img.prompt,
                'model':      img.model_used,
                'created_at': img.created_at.isoformat(),
            }
            for img in query.all()
        ]
    except Exception as e:
        print(f"[DB ERROR] get_images: {e}")
        return []