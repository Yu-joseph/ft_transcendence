<<<<<<< HEAD
<<<<<<< HEAD
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

=======
from flask_sqlalchemy  import SQLAlchemy
from datetime import datetime



>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

>>>>>>> dd5f97c (merging current changes with all team members)
db = SQLAlchemy()

class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'
    session_id    = db.Column(db.String, primary_key=True)
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd5f97c (merging current changes with all team members)
    user_id       = db.Column(db.String, nullable=True, index=True)  
    # ← added
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    message_count = db.Column(db.Integer, default=0)
<<<<<<< HEAD

    messages = db.relationship('Message', backref='session', lazy=True)


class Message(db.Model):
    __tablename__ = 'messages'
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String, db.ForeignKey('chat_sessions.session_id'), nullable=False)
    role       = db.Column(db.String, nullable=False)
    content    = db.Column(db.Text, nullable=False)
    timestamp  = db.Column(db.DateTime, default=datetime.utcnow)



class Image(db.Model):
    __tablename__ = 'images'
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String, db.ForeignKey('chat_sessions.session_id'), nullable=True)
    user_id    = db.Column(db.String, nullable=True, index=True)
    prompt     = db.Column(db.Text, nullable=False)
    filename   = db.Column(db.String, nullable=False)
    url        = db.Column(db.String, nullable=False)
    model_used = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
=======
    created_at   = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at  = db.Column(db.DateTime , default=datetime.utcnow , onupdate=datetime.utcnow)
    message_count =  db.Column(db.Integer , default=0)
=======
>>>>>>> dd5f97c (merging current changes with all team members)

    messages = db.relationship('Message', backref='session', lazy=True)


class Message(db.Model):
<<<<<<< HEAD
    __tablename__ = 'messages'  
    id = db.Column(db.Integer , primary_key=True , autoincrement=True)
    session_id  = db.Column(db.String, db.ForeignKey('chat_sessions.session_id') , nullable=False)
    role = db.Column(db.String , nullable=False)
    content = db.Column(db.Text , nullable=False)
    timestamp = db.Column(db.DateTime , default=datetime.utcnow)
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
    __tablename__ = 'messages'
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String, db.ForeignKey('chat_sessions.session_id'), nullable=False)
    role       = db.Column(db.String, nullable=False)
    content    = db.Column(db.Text, nullable=False)
    timestamp  = db.Column(db.DateTime, default=datetime.utcnow)



class Image(db.Model):
    __tablename__ = 'images'
    id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String, db.ForeignKey('chat_sessions.session_id'), nullable=True)
    user_id    = db.Column(db.String, nullable=True, index=True)
    prompt     = db.Column(db.Text, nullable=False)
    filename   = db.Column(db.String, nullable=False)
    url        = db.Column(db.String, nullable=False)
    model_used = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
>>>>>>> dd5f97c (merging current changes with all team members)




<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> dd5f97c (merging current changes with all team members)
def save_image(prompt, filename, url, model_used=None, session_id=None, user_id=None):
    try:
        img = Image(
            prompt=prompt,
            filename=filename,
            url=url,
            model_used=model_used,
            session_id=session_id,
            user_id=user_id
        )
        db.session.add(img)
        db.session.commit()
        print(f"[DB] Image saved: {filename}")
    except Exception as e:
        db.session.rollback()
        print(f"[Database ERROR] Failed to save image: {e}")

def save_message(session_id, role, content, user_id=None):  
    # ← user_id param
<<<<<<< HEAD
    try:
        session = ChatSession.query.get(session_id)
        if not session:
            session = ChatSession(session_id=session_id, user_id=user_id) 
             # ← store it
            db.session.add(session)

        msg = Message(session_id=session_id, role=role, content=content)
=======
def save_message(session_id, role, content):
=======
>>>>>>> dd5f97c (merging current changes with all team members)
    try:
        session = ChatSession.query.get(session_id)
        if not session:
            session = ChatSession(session_id=session_id, user_id=user_id) 
             # ← store it
            db.session.add(session)
<<<<<<< HEAD
        
        msg = Message(session_id=session_id , role=role , content=content)
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======

        msg = Message(session_id=session_id, role=role, content=content)
>>>>>>> dd5f97c (merging current changes with all team members)
        db.session.add(msg)

        session.message_count = (session.message_count or 0) + 1
        session.updated_at = datetime.utcnow()
<<<<<<< HEAD
<<<<<<< HEAD
=======

>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
>>>>>>> dd5f97c (merging current changes with all team members)
        db.session.commit()

    except Exception as e:
        db.session.rollback()
<<<<<<< HEAD
<<<<<<< HEAD
        print(f"[Database ERROR] Failed to save message: {e}")


def get_messages(session_id):
    # unchanged — session_id is already unique enough
=======
        print(f"[Database ERROR ] Failed to save message: {e}")


def get_messages(session_id):
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
        print(f"[Database ERROR] Failed to save message: {e}")


def get_messages(session_id):
    # unchanged — session_id is already unique enough
>>>>>>> dd5f97c (merging current changes with all team members)
    try:
        messages = (
            Message.query
            .filter_by(session_id=session_id)
            .order_by(Message.timestamp.asc())
            .all()
        )
<<<<<<< HEAD
<<<<<<< HEAD
        return [
            {"role": m.role, "content": m.content, "timestamp": m.timestamp.isoformat()}
            for m in messages
        ]
    except Exception as e:
        print(f"[Database ERROR] Failed to get messages: {e}")
        return []


def get_sessions(user_id=None):  
    # ← filter by user
    try:
        query = ChatSession.query.order_by(ChatSession.updated_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)  
            # ← only this user's sessions

        result = []
        for s in query.all():
=======


=======
>>>>>>> dd5f97c (merging current changes with all team members)
        return [
            {"role": m.role, "content": m.content, "timestamp": m.timestamp.isoformat()}
            for m in messages
        ]
    except Exception as e:
        print(f"[Database ERROR] Failed to get messages: {e}")
        return []


def get_sessions(user_id=None):  
    # ← filter by user
    try:
        query = ChatSession.query.order_by(ChatSession.updated_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)  
            # ← only this user's sessions

<<<<<<< HEAD
        result =[]
        for s in sessions:
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
        result = []
        for s in query.all():
>>>>>>> dd5f97c (merging current changes with all team members)
            first_msg = (
                Message.query
                .filter_by(session_id=s.session_id, role='user')
                .order_by(Message.timestamp.asc())
                .first()
            )
            if first_msg and len(first_msg.content) > 30:
<<<<<<< HEAD
<<<<<<< HEAD
                title = first_msg.content[:30] + '...'
            elif first_msg:
                title = first_msg.content
            else:
                title = 'New chat'
=======
                title = first_msg.content[:30]  + '...'
            elif first_msg:
                title = first_msg.content
            else:
                title= 'New chat'
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
                title = first_msg.content[:30] + '...'
            elif first_msg:
                title = first_msg.content
            else:
                title = 'New chat'
>>>>>>> dd5f97c (merging current changes with all team members)

            result.append({
                'session_id':    s.session_id,
                'title':         title,
                'message_count': s.message_count,
                'created_at':    s.created_at.isoformat()
            })
        return result
<<<<<<< HEAD
<<<<<<< HEAD

    except Exception as e:
        print(f"[DB ERROR] Failed to get sessions: {e}")
        return []
    


def get_images(user_id=None, session_id=None):
    try:
        query = Image.query.order_by(Image.created_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)
        elif session_id:
            query = query.filter_by(session_id=session_id)
        return [
            {'url': img.url, 'prompt': img.prompt, 'model': img.model_used, 'created_at': img.created_at.isoformat()}
            for img in query.all()
        ]
    except Exception as e:
        print(f"[DB ERROR] Failed to get images: {e}")
        return []
=======
    
    except  Exception as e:
=======

    except Exception as e:
>>>>>>> dd5f97c (merging current changes with all team members)
        print(f"[DB ERROR] Failed to get sessions: {e}")
        return []
    


<<<<<<< HEAD














>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
def get_images(user_id=None, session_id=None):
    try:
        query = Image.query.order_by(Image.created_at.desc())
        if user_id:
            query = query.filter_by(user_id=user_id)
        elif session_id:
            query = query.filter_by(session_id=session_id)
        return [
            {'url': img.url, 'prompt': img.prompt, 'model': img.model_used, 'created_at': img.created_at.isoformat()}
            for img in query.all()
        ]
    except Exception as e:
        print(f"[DB ERROR] Failed to get images: {e}")
        return []
>>>>>>> dd5f97c (merging current changes with all team members)
