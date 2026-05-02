from flask import Blueprint, request, jsonify
from api.auth import get_user_id
from database.queries import get_sessions , get_messages , check_session_exist
from database.models import ChatSession, Message
from extensions import db
import uuid


session_bp = Blueprint('session', __name__, url_prefix='/api')


@session_bp.post('/new-session')
def new_session():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    session_id = str(uuid.uuid4())
    db.session.add(ChatSession(session_id=session_id, user_id=user_id))
    db.session.commit()
    return jsonify({'session_id': session_id})


@session_bp.post('/set-session')
def set_session():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    session_id = data.get('session_id')
    if not session_id:
        return jsonify({'error': 'No session_id provided'}), 400

    if not check_session_exist(session_id=session_id , user_id=user_id):
        return jsonify({'error': 'Session not found or access denied'}), 403


    messages = get_messages(session_id)
    formatted = [
        {
            'role': m['role'],
            'content': m['content'].replace('\n', '<br>'),
            'timestamp': m.get('timestamp', ''),
        }
        for m in messages
    ]
    return jsonify({'session_id': session_id, 'messages': formatted})


@session_bp.get('/sessions')
def sessions():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify(get_sessions(user_id=user_id))


@session_bp.delete('/delete-session')
def delete_session():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    session_id = data.get('session_id')
    if not session_id:
        return jsonify({'error': 'No session id provided'}), 400

    try:
        session = ChatSession.query.filter_by(session_id=session_id, user_id=user_id).first()
        if not session:
            return jsonify({"error": 'Session not found'}), 404

        Message.query.filter_by(session_id=session_id).delete()
        db.session.delete(session)
        db.session.commit()
        return jsonify({'status': 'deleted'})
    except Exception as e:
        db.session.rollback()
        print(f"[Delete ERROR] {e}")
        return jsonify({'error': str(e)}), 500





