import json
import random
from train import check_winner
with open("q_table.json", "r") as f:
    q_table = json.load(f)


def get_state(board, phase, player):
    state = ""
    for cell in board:
        state += cell if cell else "-"
    return state + "_" + phase + "_" + player


def get_available_actions(board, phase, player):
    actions = []

    if phase == "place":
        for i in range(len(board)):
            if board[i] == "":
                actions.append({
                    "type": "place",
                    "to": i,
                    "key": "p" + str(i)
                })
        return actions

    my_pieces = []
    empty = []

    for i in range(len(board)):
        if board[i] == player:
            my_pieces.append(i)
        elif board[i] == "":
            empty.append(i)

    if len(my_pieces) < 3:
        return []

    for j in my_pieces:
        for k in empty:
            actions.append({
                "type": "move",
                "from": j,
                "to": k,
                "key": f"m{j}_{k}"
            })

    return actions


def get_best_action(state, actions):
    if state not in q_table:
        return random.choice(actions)

    best = None
    best_value = float("-inf")

    for action in actions:
        value = q_table[state].get(action["key"], 0.0)
        if value > best_value:
            best_value = value
            best = action

    return best



def get_winning_move(board, actions, player):
    for action in actions:
        temp_board = board.copy()
        if action["type"] == "place":
            temp_board[action["to"]] = player
        else:
            temp_board[action["from"]] = ""
            temp_board[action["to"]] = player

        if check_winner(temp_board , player):
            return action
        
    return None


def get_difficulty_action(state, actions, difficulty , board , player):

    win = get_winning_move(board ,actions , player)
    if win:
        return win
    

    if difficulty == "hard":
        return get_best_action(state, actions)
    
    elif difficulty == "medium":
        b = random.random()
        print("-------------------------- medium  ------------------------------------------- \n\n\n\n")
        print(f"a  ==   {b}" , flush=True )
        if b < 0.7:
            return get_best_action(state, actions)
        else:
            return random.choice(actions)
    
    elif difficulty == "easy":
        a = random.random()
        print("-------------------------- easy  ------------------------------------------- \n\n\n\n")
        print(f"a  ==   {a}" , flush=True )

        if  a < 0.4:
            return get_best_action(state, actions)
        else:
            return random.choice(actions)
    
    else:
        return get_best_action(state, actions)
