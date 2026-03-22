from flask import Flask, request, jsonify, send_from_directory, stream_with_context, Response, redirect, url_for, render_template
from flask_cors import CORS
import os
import uuid
import time
import requests
from dotenv import load_dotenv
from database import db, get_sessions
from routes import ChatManager

load_dotenv()

app = Flask(
    __name__,
    template_folder="/app/templates",
    static_folder="/app/static"
)
CORS(app)

# =====================
# DATABASE CONFIG
# =====================
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"postgresql://{os.environ.get('DB_USER')}:"
    f"{os.environ.get('DB_PASSWORD')}@"
    f"{os.environ.get('DB_HOST')}:"
    f"{os.environ.get('DB_PORT')}/"
    f"{os.environ.get('DB_NAME')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 1800,
    'pool_pre_ping': True,
}

db.init_app(app)


# FIX 1: db.create_all() can fail if postgres isn't ready yet.
# Retry up to 5 times with a delay instead of crashing on startup.
def init_db():
    for attempt in range(1, 6):
        try:
            with app.app_context():
                db.create_all()
                print("[chat_api] Database connected ✅")
                return
        except Exception as e:
            print(f"[chat_api] DB not ready, attempt {attempt}/5: {e}")
            time.sleep(3)
    print("[chat_api] Could not connect to database after 5 attempts")


init_db()

# =====================
# UPLOAD FOLDER
# =====================
UPLOAD_FOLDER = "/app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# =====================
# GAME API URL
# =====================
# FIX 2: fallback so app doesn't silently break if env var is missing
GAME_API_URL = os.getenv("GAME_API_URL", "http://game-api:5001")

# =====================
# CHAT MANAGER
# =====================
chat = ChatManager()


# =====================
# PAGE ROUTES
# =====================
@app.route('/')
def home():
    return redirect(url_for('game'))


@app.route('/game')
def game():
    return render_template('game.html')


# The browser fetches /q_table.json directly — proxy it from game_api
@app.route('/q_table.json')
def serve_qtable():
    try:
        res = requests.get(f"{GAME_API_URL}/q_table.json", timeout=5)
        return res.content, res.status_code, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'error': str(e)}), 503


# =====================
# STATIC FILES
# =====================
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# =====================
# GAME API PROXY
# =====================
@app.route('/api/ai-move', methods=['POST'])
def proxy_ai():
    try:
        res = requests.post(
            f"{GAME_API_URL}/api/ai-move",
            json=request.get_json(),
            timeout=5,
        )
        return jsonify(res.json()), res.status_code
    except requests.exceptions.ConnectionError:
        return jsonify({"error": "Game AI service unavailable"}), 503
    except requests.exceptions.Timeout:
        return jsonify({"error": "Game AI service timed out"}), 504


# =====================
# CHAT API
# =====================
@app.route('/api/chat', methods=['POST'])
def api_chat():
    data   = request.get_json()
    result = chat.chat(data.get('message', '').strip())
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)


@app.route('/api/chat/stream', methods=['POST'])
def api_chat_stream():
    data    = request.get_json()
    message = data.get('message', '').strip()
    if not message:
        return jsonify({'error': 'Empty message'}), 400

    generator = chat.chat_stream(message)
    return Response(
        stream_with_context(generator()),
        mimetype='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no'}
    )


# =====================
# SESSION API
# =====================
@app.route('/api/new-session', methods=['POST'])
def api_new_session():
    return jsonify({'session_id': chat.new_session()})


@app.route('/api/set-session', methods=['POST'])
def api_set_session():
    data = request.get_json()
    return jsonify({'messages': chat.set_session(data.get('session_id'))})


@app.route('/api/sessions', methods=[ 'GET'])
def api_sessions():
    return jsonify(get_sessions())


@app.route('/api/clear', methods=['POST'])
def api_clear():
    chat.clear()
    return jsonify({'status': 'cleared'})


@app.route('/api/history', methods=['GET'])
def api_history():
    return jsonify(chat.chat_history)


# =====================
# UPLOAD API
# =====================
@app.route('/api/upload', methods=['POST'])
def api_upload():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    filename = f"{uuid.uuid4()}_{file.filename}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    return jsonify({
        'filename': file.filename,
        'path':     f'/uploads/{filename}',
        'size':     os.path.getsize(filepath)
    })


# =====================
# FRONTEND (LLM STUDIO)
# =====================
@app.route('/studio')
def studio():
    return send_from_directory("/app/static/llm-studio", "index.html")


@app.route('/studio/<path:path>')
def studio_files(path):
    return send_from_directory("/app/static/llm-studio", path)




# =====================
# HEALTH CHECK
# =====================
@app.route('/health')
def health():
    return jsonify({"status": "ok"})


# =====================
# ERROR HANDLER
# =====================
@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": str(e)}), 500


# =====================
# RUN
# =====================
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)