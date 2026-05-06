from flask import Blueprint, request, jsonify, Response, stream_with_context
from api.auth import get_user_id
from manager import ChatManager
from database.queries import   check_session_exist
from database.models import ChatSession 
from extensions import db
from rate_limiting import check_rate_limit


chat_bp = Blueprint('chat', __name__, url_prefix='/api')

MAX_INPUT_CHARS = 4000




@chat_bp.post('/chat/stream')
def chat_stream():

    user_id = get_user_id()
    if not user_id :
        return jsonify ({"error" : "Unauthorized"}) , 401

    if not check_rate_limit(user_id):
        return jsonify({"error": "Too many requests, you have 5/min and 500/day"}), 429
    
    data       = request.get_json()
    message    = data.get('message', '').strip()
    session_id = data.get('session_id')

    if not message:
        return jsonify({'error': 'Empty message'}), 400

    if len(message) > MAX_INPUT_CHARS:
        return jsonify({"error" : f"Message too long (max {MAX_INPUT_CHARS} characters)" }) , 400


    if not session_id:
        return jsonify({'error': 'session_id is required'}), 400
    
    if not check_session_exist(session_id , user_id):
        return jsonify({'error': 'Session not found or access denied'}), 403


    chat = ChatManager(session_id=session_id, user_id=user_id)

    return Response(
        stream_with_context(chat.chat_stream(message)),
        mimetype='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'},
    )


    


@chat_bp.post('/clear')
def clear():
    return jsonify({'status': 'cleared'})


@chat_bp.post('/generate-title')
def generate_title():
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json()
    message = data.get('message', '')
    session_id = data.get('session_id')

    if not message or not session_id:
        return jsonify({'title': 'New Chat'})
    
    if not  check_session_exist(session_id=session_id , user_id=user_id):
        return jsonify({'error': 'Session not found or access denied'}), 403

    try:
        session = db.session.get(ChatSession, session_id)

        if session.title:
            return jsonify({'title': session.title})

        chat = ChatManager(session_id=session_id, user_id=user_id)
        title = chat.generate_title(message)
        
        session.title = title
        db.session.commit()
        return jsonify({'title': title})

    except Exception as e:
        print(f"[Title ERROR] {e}")
        return jsonify({'title': 'New Chat'})

    