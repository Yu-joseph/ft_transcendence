from flask import Blueprint, request, jsonify, Response, stream_with_context
from api.auth import get_user_id
from manager import ChatManager
from database.queries import update_session_title
from database.models import ChatSession
from extensions import db


chat_bp = Blueprint('chat', __name__, url_prefix='/api')


def get_chat():
    chat = ChatManager()
    chat.set_user(get_user_id())
    return chat


@chat_bp.post('/chat/stream')
def api_chat_stream():
    data       = request.get_json()
    message    = data.get('message', '').strip()
    session_id = data.get('session_id')

    if not message:
        return jsonify({'error': 'Empty message'}), 400

    if not session_id:
        return jsonify({'error': 'session_id is required'}), 400

    chat = get_chat()
    chat.set_session(session_id)

    return Response(
        stream_with_context(chat.chat_stream(message)),
        mimetype='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'},
    )


@chat_bp.get('/history')
def api_history():
    chat = get_chat()
    return jsonify(chat.chat_history)


@chat_bp.post('/clear')
def api_clear():
    chat = get_chat()
    chat.clear()
    return jsonify({'status': 'cleared'})


@chat_bp.post('/generate-title')
def api_generate_title():
    data       = request.get_json()
    message    = data.get('message', '')
    session_id = data.get('session_id')

    if not message or not session_id:
        return jsonify({'title': 'New Chat'})

    chat = get_chat()
    try:
        session = ChatSession.query.get(session_id)

        if not session:
            session = ChatSession(session_id=session_id, user_id=get_user_id())
            db.session.add(session)
            db.session.commit()

        if session.title:
            return jsonify({'title': session.title})

        title = chat.generate_title(message)
        update_session_title(session_id, title)
        return jsonify({'title': title})

    except Exception as e:
        print(f"[Title ERROR] {e}")
        return jsonify({'title': 'New Chat'})
    




    