from flask import Flask, request, jsonify, send_from_directory
import os
from q_learning import  get_difficulty_action
from utils import get_state, get_available_actions

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    import json
    with open(os.path.join(BASE_DIR, "q_table.json"), "r") as f:
        q_table = json.load(f)
except Exception as e:
    print(f"Failed to load q_table.json: {e}")
    q_table = {}


# @app.route("/", methods=["GET"])
# def home():
#     return jsonify({
#         "message": "Game AI API is running",
#         "endpoints": [
#             "/api/ai-move",
#             "/q_table.json"
#         ]
#     })

# @app.route("/q_table.json", methods=["GET"])
# def serve_qtable():
#     return send_from_directory(BASE_DIR, "q_table.json")


@app.route("/api/ai-move", methods=["POST"])
def ai_move():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        board = data.get("board")
        phase = data.get("phase")
        player = data.get("player", "O")
        difficulty = data.get("difficulty" , "hard")
        

        if not isinstance(board, list)  or len(board) != 9:
            return jsonify({"error": "'board' must be a list of 9 elements "}), 400
        
        if any(cell not in ["X", "O" , ""] for cell in board):
            return jsonify({"error" : "Invalid board values "}), 400

        if phase not in ("place", "move"):
            return jsonify({"error": "'phase' must be 'place' or 'move'"}), 400
        
        if difficulty not in ("easy" , "medium"  , "hard"):
            return jsonify({"error": "'difficulty' must be 'easy', 'medium', or 'hard'"}), 400

        state = get_state(board, phase, player)
        actions = get_available_actions(board, phase, player)

        if not actions:
            return jsonify({"error": "No moves available"}), 400

        action = get_difficulty_action(state, actions , difficulty , board, player)

        return jsonify({
            "action": action,
            "state": state,
            "difficulty" : difficulty
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)