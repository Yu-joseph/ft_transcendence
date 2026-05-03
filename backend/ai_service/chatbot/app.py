import time
from flask import Flask  , jsonify
from flask_cors import CORS
from config import AppConfig
from extensions import db 
from api import chat_bp, session_bp




def register_error_handlers(app):

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error' : "Bad request"}), 400
    
    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error' : "Unauthorized" }) , 401
    
    @app.errorhandler(404)
    def  not_found(e):
        return jsonify({"error" : "Not found"}) , 404
    
    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error" : "Internal server error"}),500
    
    @app.errorhandler(Exception)
    def handle_exception(e):
        print(f"[GLOBAL ERROR] {e}")
        return jsonify({"error" : str(e)}) , 500
        




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
    app = Flask(__name__)
    
    app.config.from_object(AppConfig)
    CORS(app)

    db.init_app(app)
    _init_db(app)


    for bp in (chat_bp, session_bp ):
        app.register_blueprint(bp)

    register_error_handlers(app)
    
    return app



app = create_app()



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000 )