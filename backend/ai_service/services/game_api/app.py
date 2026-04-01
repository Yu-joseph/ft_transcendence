# from flask import Flask, request, jsonify, send_from_directory
# from q_learning import get_state, get_available_actions, get_best_action

# app = Flask(__name__)


# @app.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "ok"})



# @app.route("/q_table.json", methods=["GET"])
# def serve_qtable():
#     return send_from_directory("/app", "q_table.json")


# @app.route("/api/ai-move", methods=["POST"])
# def ai_move():
#     data   = request.get_json(silent=True)
#     board  = data.get("board")
#     phase  = data.get("phase")
#     player = data.get("player", "O")

#     if not board or not isinstance(board, list):
#         return jsonify({"error": "Missing or invalid 'board'"}), 400
#     if phase not in ("place", "move"):
#         return jsonify({"error": "'phase' must be 'place' or 'move'"}), 400

#     state   = get_state(board, phase, player)
#     actions = get_available_actions(board, phase, player)

#     if not actions:
#         return jsonify({"error": "No moves available"}), 400

#     action = get_best_action(state, actions)
#     return jsonify(action)


# # @app.errorhandler(Exception)
# # def handle_error(e):
# #     return jsonify({"error": str(e)}), 500

    
# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5001, debug=False)

















from flask import Flask, request, jsonify, send_from_directory
<<<<<<< HEAD
<<<<<<< HEAD
import os
=======
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
import os
>>>>>>> dc8dfb9 (SA)
from q_learning import get_state, get_available_actions, get_best_action

app = Flask(__name__)

<<<<<<< HEAD
<<<<<<< HEAD
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    import json
    with open(os.path.join(BASE_DIR, "q_table.json"), "r") as f:
        q_table = json.load(f)
except Exception as e:
    print(f"Failed to load q_table.json: {e}")
    q_table = {}


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Game AI API is running",
        "endpoints": [
            # "/health",
            "/api/ai-move",
            "/q_table.json"
        ]
    })


# @app.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "ok"})


@app.route("/q_table.json", methods=["GET"])
def serve_qtable():
    return send_from_directory(BASE_DIR, "q_table.json")
=======
=======
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
>>>>>>> dc8dfb9 (SA)

try:
    import json
    with open(os.path.join(BASE_DIR, "q_table.json"), "r") as f:
        q_table = json.load(f)
except Exception as e:
    print(f"Failed to load q_table.json: {e}")
    q_table = {}


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Game AI API is running",
        "endpoints": [
            # "/health",
            "/api/ai-move",
            "/q_table.json"
        ]
    })


# @app.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "ok"})


@app.route("/q_table.json", methods=["GET"])
def serve_qtable():
<<<<<<< HEAD
    return send_from_directory("/app", "q_table.json")
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======
    return send_from_directory(BASE_DIR, "q_table.json")
>>>>>>> dc8dfb9 (SA)


@app.route("/api/ai-move", methods=["POST"])
def ai_move():
<<<<<<< HEAD
<<<<<<< HEAD
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        board = data.get("board")
        phase = data.get("phase")
        player = data.get("player", "O")
        

        if not isinstance(board, list):
            return jsonify({"error": "'board' must be a list"}), 400

        if phase not in ("place", "move"):
            return jsonify({"error": "'phase' must be 'place' or 'move'"}), 400

        state = get_state(board, phase, player)
        actions = get_available_actions(board, phase, player)

        if not actions:
            return jsonify({"error": "No moves available"}), 400

        action = get_best_action(state, actions)

        return jsonify({
            "action": action,
            "state": state
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)

=======
    data   = request.get_json(silent=True)
    board  = data.get("board")
    phase  = data.get("phase")
    player = data.get("player", "O")
=======
    try:
        data = request.get_json(silent=True)
>>>>>>> dc8dfb9 (SA)

        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        board = data.get("board")
        phase = data.get("phase")
        player = data.get("player", "O")

        if not isinstance(board, list):
            return jsonify({"error": "'board' must be a list"}), 400

        if phase not in ("place", "move"):
            return jsonify({"error": "'phase' must be 'place' or 'move'"}), 400

        state = get_state(board, phase, player)
        actions = get_available_actions(board, phase, player)

        if not actions:
            return jsonify({"error": "No moves available"}), 400

        action = get_best_action(state, actions)

        return jsonify({
            "action": action,
            "state": state
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
<<<<<<< HEAD
>>>>>>> 22d4bda (adding getuser endpoint in nginx)
=======

>>>>>>> dc8dfb9 (SA)
