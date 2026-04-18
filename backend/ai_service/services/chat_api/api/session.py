from flask import Blueprint, request, jsonify
from api.auth import get_user_id
from database.queries import get_sessions
from database.models import ChatSession
from extensions import db
from api.chat import get_chat


session_bp = Blueprint('session', __name__, url_prefix='/api')


@session_bp.post('/new-session')
def api_new_session():
    chat       = get_chat()
    session_id = chat.new_session()
    user_id    = get_user_id()

    db.session.add(ChatSession(session_id=session_id, user_id=user_id))
    db.session.commit()

    return jsonify({'session_id': session_id})


@session_bp.post('/set-session')
def api_set_session():
    data       = request.get_json()
    session_id = data.get('session_id')

    if not session_id:
        return jsonify({'error': 'No session_id provided'}), 400

    chat     = get_chat()
    messages = chat.set_session(session_id)

    formatted = [
        {
            'role':      m['role'],
            'content':   m['content'].replace('\n', '<br>'),
            'timestamp': m.get('timestamp', ''),
        }
        for m in messages
    ]
    return jsonify({'session_id': session_id, 'messages': formatted})


@session_bp.get('/sessions')
def api_sessions():
    return jsonify(get_sessions(user_id=get_user_id()))