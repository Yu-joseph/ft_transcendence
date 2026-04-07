from flask import Flask, request, jsonify, send_from_directory, stream_with_context, Response, redirect, url_for, render_template
from flask_cors import CORS
import os
import uuid
import time
import requests
from dotenv import load_dotenv
from database import db, get_sessions
from routes import ChatManager
from llm.chains import generate_title
from database import get_images

load_dotenv()

app = Flask(
    __name__,
    template_folder="/app/templates",
    static_folder="/app/static"
)
CORS(app)

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

UPLOAD_FOLDER = "/app/uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

GAME_API_URL = os.getenv("GAME_API_URL", "http://game-api:5001")

chat = ChatManager()


def get_user_id():
    return request.headers.get('X-User-Id')

@app.route('/')
def home():
    return redirect(url_for('game'))


@app.route('/game')
def game():
    return render_template('game.html')


@app.route('/q_table.json')
def serve_qtable():
    try:
        res = requests.get(f"{GAME_API_URL}/q_table.json", timeout=5)
        return res.content, res.status_code, {'Content-Type': 'application/json'}
    except Exception as e:
        return jsonify({'error': str(e)}), 503


@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


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


@app.route('/api/chat', methods=['POST'])
def api_chat():
    chat.set_user(get_user_id())
    data   = request.get_json()
    result = chat.chat(data.get('message', '').strip())
    if isinstance(result, tuple):
        return jsonify(result[0]), result[1]
    return jsonify(result)


@app.route('/api/chat/stream', methods=['POST'])
def api_chat_stream():
    chat.set_user(get_user_id())
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


@app.route('/api/image', methods=['POST'])
def api_image():
    data    = request.get_json()
    message = data.get('message', '').strip()
    if not message:
        return jsonify({'error': 'Empty prompt'}), 400

    result = chat.generate_image(message, user_id=get_user_id())

    if isinstance(result, str) and result.startswith('/static/'):
        return jsonify({'image_url': result})
    
    return jsonify({'error': result or 'Image generation failed'}), 500  # ← add this


@app.route('/api/new-session', methods=['POST'])
def api_new_session():
    chat.set_user(get_user_id())
    return jsonify({'session_id': chat.new_session()})


@app.route('/api/set-session', methods=['POST'])
def api_set_session():
    data = request.get_json()
    return jsonify({'messages': chat.set_session(data.get('session_id'))})


@app.route('/api/sessions', methods=[ 'GET'])
def api_sessions():
    return jsonify(get_sessions(user_id=get_user_id()))


@app.route('/api/clear', methods=['POST'])
def api_clear():
    chat.clear()
    return jsonify({'status': 'cleared'})


@app.route('/api/history', methods=['GET'])
def api_history():
    return jsonify(chat.chat_history)


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


@app.route('/studio')
def studio():
    return send_from_directory("/app/static/llm-studio", "index.html")


@app.route('/studio/<path:path>')
def studio_files(path):
    return send_from_directory("/app/static/llm-studio", path)


@app.route('/api/images', methods=['GET'])
def api_images():
    return jsonify(get_images(user_id=get_user_id()))


@app.route('/health')
def health():
    return jsonify({"status": "ok"})


@app.errorhandler(Exception)
def handle_exception(e):
    return jsonify({"error": str(e)}), 500


@app.route("/api/generate-title", methods=['POST'])
def generate_title_route():
    data = request.json
    message = data.get("message", "")

    if not message:
        return jsonify({"title": "New Chat"})

    title = generate_title(message)
    return jsonify({"title": title})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)