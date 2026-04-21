from flask import Blueprint, request, jsonify
from api.auth import get_user_id
from database.queries import get_sessions
from database.models import ChatSession , Message
from extensions import db
from api.chat import get_chat


session_bp = Blueprint('session', __name__, url_prefix='/api')


@session_bp.post('/new-session')
def new_session():
    chat       = get_chat()
    session_id = chat.new_session()
    user_id    = get_user_id()

    if not user_id:
        print("************************---------------------**************-\n\n\n\n\n" , flush=True)
        return jsonify ({'error' : 'Unauthorized'})

    db.session.add(ChatSession(session_id=session_id, user_id=user_id))
    db.session.commit()

    return jsonify({'session_id': session_id})


@session_bp.post('/set-session')
def set_session():
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
def sessions():
    return jsonify(get_sessions(user_id=get_user_id()))



@session_bp.delete('/detete-session')
def delete_session():
    data = request.get()
    print(f"datat =  {data} \n\n " , flush=True)

    session_id = data.get('session_id')
    print(f"session_id  ===       {session_id} \n\n " , flush=True)

    if not session_id:
        return jsonify({'error' : 'No session id provided'}) , 400
    
    user_id = get_user_id()
    if not user_id:
        return jsonify({'error' , 'Unauthorized'}) , 401
    

    try:
        session = ChatSession.query.filter_by(session_id=session_id , user_id=user_id).first()
        if not session :
            return jsonify({"error" : 'Session not found'}) , 404
        
        Message.query.filter_by(session_id=session_id).delete()
        db.session.delete(session)
        db.session.commit()
        return jsonify({'status' : 'deleted'})
    except Exception as e:
        db.session.rollback()
        print(f"[Delete ERROR] {e}")
        return jsonify({'error' : str(e) }) , 500

    