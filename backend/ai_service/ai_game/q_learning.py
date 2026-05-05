import json
import random
from utils import check_winner, action_to_key
import os

try:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(BASE_DIR , "q_table.json") , "r") as f:
        content = f.read().strip()
        q_table = json.loads(content) if content else {}
except Exception:
    q_table = {}



def get_winning_move(board, actions, player):
    for action in actions:
        temp = board.copy()
        if action[0] == 'place':
            temp[action[1]] = player
        else:
            temp[action[1]] = ''
            temp[action[2]] = player
        if check_winner(temp, player):
            return action
    return None




def get_best_action(state, actions):
    if state not in q_table:
        return random.choice(actions)
    return max(actions, key=lambda a: q_table[state].get(action_to_key(a), 0.0))




def tuple_to_dict(action):
    if action[0] == 'place':
        return {"type": "place", "to": action[1], "key": f"p{action[1]}"}
    return {"type": "move", "from": action[1], "to": action[2], "key": f"m{action[1]}_{action[2]}"}




def get_difficulty_action(state, actions, difficulty, board, player):

    if difficulty == "hard":
        action = get_best_action(state, actions)

    else:

        win = get_winning_move(board, actions, player)
        if win:
            return tuple_to_dict(win)


        elif difficulty == "medium":
            action = get_best_action(state, actions) if random.random() < 0.7 else random.choice(actions)
        elif difficulty == "easy":
            action = get_best_action(state, actions) if random.random() < 0.4 else random.choice(actions)
        else:
            action = get_best_action(state, actions)

    return tuple_to_dict(action)