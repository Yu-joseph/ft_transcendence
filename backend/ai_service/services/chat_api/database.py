from flask_sqlalchemy  import SQLAlchemy
from datetime import datetime



db = SQLAlchemy()

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    session_id    = db.Column(db.String, primary_key=True)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime , default=datetime.utcnow , onupdate=datetime.utcnow)
    message_count =  db.Column(db.Integer , default=0)

    messages = db.relationship('Message' , backref='session' , lazy=True)


class Message(db.Model):
    id = db.Column(db.Integer , primary_key=True , autoincrement=True)
    session_id  = db.Column(db.String, db.ForeignKey('chat_sessions.session_id') , nullable=False)
    role = db.Column(db.String , nullable=False)
    content = db.Column(db.Text , nullable=False)
    timestamp = db.Column(db.DateTime , default=datetime.utcnow)




def save_message(session_id, role, content):
    try:
        session = ChatSession.query.get(session_id)
        if not session:
            session = ChatSession(session_id=session_id)
            db.session.add(session)
        
        msg = Message(session_id=session_id , role=role , content=content)
        db.session.add(msg)

        session.message_count = (session.message_count or 0) + 1
        session.updated_at = datetime.utcnow()

        db.session.commit()

    except Exception as e:
        db.session.rollback()
        print(f"[Database ERROR ] Failed to save message: {e}")


def get_messages(session_id):
    try:
        messages = (
            Message.query
            .filter_by(session_id=session_id)
            .order_by(Message.timestamp.asc())
            .all()
        )


        return [
            {
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp
            }
            for m in messages
        ]
    
    except Exception as e:
        print(f"[Database ERROR ] Failed to save message: {e}")
        return []




def get_sessions():
    try:
        sessions = (
            ChatSession.query
            .order_by(ChatSession.updated_at.desc())
            .all()
        )

        result =[]
        for s in sessions:
            first_msg = (
                Message.query
                .filter_by(session_id=s.session_id, role='user')
                .order_by(Message.timestamp.asc())
                .first()
            )
            if first_msg and len(first_msg.content) > 30:
                title = first_msg.content[:30]  + '...'
            elif first_msg:
                title = first_msg.content
            else:
                title= 'New chat'

            result.append({
                'session_id':    s.session_id,
                'title':         title,
                'message_count': s.message_count,
                'created_at':    s.created_at.isoformat()
            })
        return result
    
    except  Exception as e:
        print(f"[DB ERROR] Failed to get sessions: {e}")
        return []


    
















