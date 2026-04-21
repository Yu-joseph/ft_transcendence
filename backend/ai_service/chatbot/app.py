import os
import time
import uuid

from flask import Flask 
from flask_cors import CORS
from config import AppConfig
from extensions import db
from api import chat_bp, session_bp



def _init_db(app: Flask):
    for i in range(1, 6):
        try:
            with app.app_context():
                db.create_all()
                print("[chat_bot] Database connected")
                return
        except Exception as e:
            print(f"[chat_bot] DB not ready, attempt {i}/5: {e}")
            time.sleep(3)
    print("[chat_bot] Could not connect to database after 5 attempts")



def create_app() -> Flask:
    app = Flask(__name__ )
    app.config.from_object(AppConfig)
    CORS(app)

    db.init_app(app)
    _init_db(app)

    for bp in (chat_bp, session_bp ):
        app.register_blueprint(bp)
    return app


app = create_app()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000 )