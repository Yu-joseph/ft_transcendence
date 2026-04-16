from datetime import datetime
from extensions import db



class ChatSession(db.Model):
    __tablename__ = 'chat_sessions'

    session_id    = db.Column(db.String, primary_key=True)
    user_id       = db.Column(db.String, nullable=False, index=True)
    title         = db.Column(db.String, nullable=True)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at    = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    message_count = db.Column(db.Integer, default=0)
    messages      = db.relationship('Message', backref='session', lazy=True)


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





# class Image(db.Model):
#     __tablename__  = 'images'

#     id         = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     session_id = db.Column(db.Integer ,  db.ForeignKey('chat_sessions.session_id'), nullable=False, Index=True)
#     prompt     = db.Column(db.String , nullable=False)
#     filename = db.Column(db.String , nullable=False)
#     url        = db.Column(db.String, nullable=False)
#     model_used = db.Column(db.String, nullable=True)
#     created_at = db.Column(db.DateTime, default=datetime.utcnow) 

