from flask import Flask, request, jsonify, send_from_directory
from q_learning import get_state, get_available_actions, get_best_action

app = Flask(__name__)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})



@app.route("/q_table.json", methods=["GET"])
def serve_qtable():
    return send_from_directory("/app", "q_table.json")


@app.route("/api/ai-move", methods=["POST"])
def ai_move():
    data   = request.get_json(silent=True)
    board  = data.get("board")
    phase  = data.get("phase")
    player = data.get("player", "O")

    if not board or not isinstance(board, list):
        return jsonify({"error": "Missing or invalid 'board'"}), 400
    if phase not in ("place", "move"):
        return jsonify({"error": "'phase' must be 'place' or 'move'"}), 400

    state   = get_state(board, phase, player)
    actions = get_available_actions(board, phase, player)

    if not actions:
        return jsonify({"error": "No moves available"}), 400

    action = get_best_action(state, actions)
    return jsonify(action)


@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)