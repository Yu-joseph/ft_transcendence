"""
Q-Learning AI Trainer for Tic-Tac-Toe
3-Piece Moving Rule: After placing 3 pieces each, players MOVE existing pieces
"""

import json
import random

LEARNING_RATE = 0.1
DISCOUNT_FACTOR = 0.95
TRAINING_GAMES = 10000000
EPSILON_START = 0.3
EPSILON_END = 0.01
EPSILON_DECAY = (EPSILON_START - EPSILON_END) / TRAINING_GAMES

q_table = {}
epsilon = EPSILON_START


def get_state(board, phase, player):
    board_str = ''.join([cell if cell else '-' for cell in board])
    return f"{board_str}_{phase}_{player}"


def get_available_actions(board, phase, player):
    if phase == 'place':
        return [('place', i) for i, cell in enumerate(board) if cell == '']
    else:
        # Moving phase: pick one of your pieces, move to empty square
        my_pieces = [i for i, cell in enumerate(board) if cell == player]
        empty = [i for i, cell in enumerate(board) if cell == '']
        moves = []
        for frm in my_pieces:
            for to in empty:
                moves.append(('move', frm, to))
        return moves


def action_to_key(action):
    if action[0] == 'place':
        return f"p{action[1]}"
    else:
        return f"m{action[1]}_{action[2]}"


def init_q_state(state, actions):
    if state not in q_table:
        q_table[state] = {}
    for a in actions:
        key = action_to_key(a)
        if key not in q_table[state]:
            q_table[state][key] = 0.0


def choose_action(state, actions, force_greedy=False):
    init_q_state(state, actions)

    if not force_greedy and random.random() < epsilon:
        return random.choice(actions)

    return max(actions, key=lambda a: q_table[state][action_to_key(a)])


def update_q_value(state, action, reward, next_state, next_actions):
    key = action_to_key(action)
    if state not in q_table or key not in q_table[state]:
        return

    if next_state in q_table and next_actions:
        max_next_q = max(
            (q_table[next_state].get(action_to_key(a), 0.0) for a in next_actions),
            default=0.0
        )
    else:
        max_next_q = 0.0

    current_q = q_table[state][key]
    q_table[state][key] = current_q + LEARNING_RATE * (
        reward + DISCOUNT_FACTOR * max_next_q - current_q
    )


def check_winner(board, player):
    wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    return any(all(board[i] == player for i in w) for w in wins)


def count_pieces(board, player):
    return sum(1 for cell in board if cell == player)


def play_training_game():
    global epsilon
    board = [''] * 9
    moves = []
    player = 'X'
    turn = 0
    max_turns = 200  # prevent infinite games

    while turn < max_turns:
        turn += 1

        # Determine phase
        if count_pieces(board, player) < 3:
            phase = 'place'
        else:
            phase = 'move'

        state = get_state(board, phase, player)
        available = get_available_actions(board, phase, player)

        if not available:
            break

        action = choose_action(state, available)
        moves.append({
            'state': state,
            'action': action,
            'player': player,
            'board': board.copy(),
            'available': available
        })

        # Apply action
        if action[0] == 'place':
            board[action[1]] = player
        else:
            board[action[1]] = ''      # remove from old position
            board[action[2]] = player  # place at new position

        # Check win
        if check_winner(board, player):
            for i in range(len(moves) - 1, -1, -1):
                move = moves[i]
                reward = 1.0 if move['player'] == player else -1.0
                if i < len(moves) - 1:
                    next_move = moves[i + 1]
                    update_q_value(move['state'], move['action'], reward,
                                   next_move['state'], next_move['available'])
                else:
                    update_q_value(move['state'], move['action'], reward, '', [])
            break

        player = 'O' if player == 'X' else 'X'

    epsilon = max(EPSILON_END, epsilon - EPSILON_DECAY)


def train():
    print("=" * 50)
    print("Tic-Tac-Toe Q-Learning (3-PIECE MOVING RULE)")
    print("=" * 50)
    print(f"Training for {TRAINING_GAMES:,} games...")

    for game in range(1, TRAINING_GAMES + 1):
        play_training_game()

        if game % 100000 == 0:
            pct = game * 100 // TRAINING_GAMES
            print(f"  {game:>9,} / {TRAINING_GAMES:,} ({pct:>3}%) | states: {len(q_table):,} | e: {epsilon:.4f}")

    print(f"\nTraining complete! Learned {len(q_table):,} states")


def save_q_table(filename='q_table.json'):
    with open(filename, 'w') as f:
        json.dump(q_table, f, indent=2)
    size_kb = len(json.dumps(q_table)) / 1024
    print(f"Saved to {filename} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    train()
    save_q_table()
    print("\nDone! Restart your app to use the new Q-table.")













































# """
# Q-Learning AI Trainer for Tic-Tac-Toe
# Optimized for PERFECT play
# """

# import json
# import random

# # Q-Learning parameters - tuned for perfect play
# LEARNING_RATE = 0.1
# DISCOUNT_FACTOR = 0.95
# TRAINING_GAMES = 500000  # 10x more training

# # Epsilon schedule: start exploratory, end greedy
# EPSILON_START = 0.3
# EPSILON_END = 0.01
# EPSILON_DECAY = (EPSILON_START - EPSILON_END) / TRAINING_GAMES

# q_table = {}
# epsilon = EPSILON_START


# def get_state(board):
#     return ''.join([cell if cell else '-' for cell in board])


# def get_available_actions(board):
#     return [i for i, cell in enumerate(board) if cell == '']


# def init_q_state(state):
#     if state not in q_table:
#         q_table[state] = {str(i): 0.0 for i in range(9)}


# def choose_action(state, board, force_greedy=False):
#     init_q_state(state)
#     available = get_available_actions(board)

#     if not force_greedy and random.random() < epsilon:
#         return random.choice(available)

#     return max(available, key=lambda a: q_table[state][str(a)])


# def update_q_value(state, action, reward, next_state, next_board):
#     init_q_state(state)
#     init_q_state(next_state)

#     next_actions = get_available_actions(next_board)
#     max_next_q = max((q_table[next_state][str(a)] for a in next_actions), default=0.0)

#     current_q = q_table[state][str(action)]
#     q_table[state][str(action)] = current_q + LEARNING_RATE * (
#         reward + DISCOUNT_FACTOR * max_next_q - current_q
#     )


# def check_winner(board, player):
#     wins = [
#         [0,1,2],[3,4,5],[6,7,8],
#         [0,3,6],[1,4,7],[2,5,8],
#         [0,4,8],[2,4,6]
#     ]
#     return any(all(board[i] == player for i in w) for w in wins)


# def play_training_game():
#     global epsilon
#     board = [''] * 9
#     moves = []
#     player = 'X'

#     while True:
#         state = get_state(board)
#         available = get_available_actions(board)

#         if not available:
#             # Draw - small reward
#             for i, move in enumerate(moves):
#                 next_board = moves[i+1]['board'] if i < len(moves)-1 else board
#                 update_q_value(move['state'], move['action'], 0.1,
#                                get_state(next_board), next_board)
#             break

#         action = choose_action(state, board)
#         moves.append({'state': state, 'action': action, 'player': player, 'board': board.copy()})
#         board[action] = player

#         if check_winner(board, player):
#             # Strong win/loss rewards
#             for i in range(len(moves) - 1, -1, -1):
#                 move = moves[i]
#                 reward = 1.0 if move['player'] == player else -1.0
#                 next_board = moves[i+1]['board'] if i < len(moves)-1 else board
#                 update_q_value(move['state'], move['action'], reward,
#                                get_state(next_board), next_board)
#             break

#         player = 'O' if player == 'X' else 'X'

#     # Decay epsilon
#     epsilon = max(EPSILON_END, epsilon - EPSILON_DECAY)


# def train():
#     print("=" * 50)
#     print("Tic-Tac-Toe Q-Learning Trainer (PERFECT MODE)")
#     print("=" * 50)
#     print(f"Training for {TRAINING_GAMES:,} games...")

#     for game in range(1, TRAINING_GAMES + 1):
#         play_training_game()

#         if game % 50000 == 0:
#             pct = game * 100 // TRAINING_GAMES
#             print(f"  {game:>7,} / {TRAINING_GAMES:,} ({pct:>3}%) | states: {len(q_table):,} | ε: {epsilon:.4f}")

#     print(f"\n✅ Training complete! Learned {len(q_table):,} states")


# def save_q_table(filename='q_table.json'):
#     with open(filename, 'w') as f:
#         json.dump(q_table, f, indent=2)  # ← add indent=2
#     size_kb = len(json.dumps(q_table)) / 1024
#     print(f"✅ Saved to {filename} ({size_kb:.1f} KB)")

# if __name__ == "__main__":
#     train()
#     save_q_table()
#     print("\n✅ Done! Restart your app to use the new Q-table.")