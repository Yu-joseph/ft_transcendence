import json
import random
from utils import check_winner, get_state, get_available_actions, action_to_key



LEARNING_RATE = 0.1
GAMMA = 0.95
TRAINING_GAMES = 1000000
EPSILON_START = 0.8
EPSILON_END = 0.01
EPSILON_DECAY = (EPSILON_START - EPSILON_END) / TRAINING_GAMES

q_table = {}
epsilon = EPSILON_START





def choose_action(state, actions ):
    init_q_state(state, actions)


    if random.random()  < epsilon:
        return random.choice(actions)

    best_action = actions[0]
    best_value = q_table[state][action_to_key(best_action)]

    for action in actions:
        key = action_to_key(action)
        value = q_table[state][key]

        if value > best_value:
            best_value = value
            best_action = action

    return best_action



def init_q_state(state, actions):
    if state not in q_table:
        q_table[state] = {}
    for a in actions:
        key = action_to_key(a)
        if key not in q_table[state]:
            q_table[state][key] = 0.0



def count_pieces(board, player):
    count = 0
    for cell in board:
        if cell == player:
            count +=1
    return count




def get_winning_move_tuples(board, actions, player):
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





def update_q_value(state, action, reward, next_state, next_actions):
    key = action_to_key(action)
    if state not in q_table or key not in q_table[state]:
        print("state not in q_table ...\n\n")
        return
    
    max_next_q = 0.0
    if next_state in q_table and next_actions:
        values =[]

        for a in next_actions:
            next_key = action_to_key(a)

            if next_key in q_table[next_state]:
                value = q_table[next_state][next_key]
            else:
                value = 0.0
            
            values.append(value)
        
        if values:
            max_next_q = max(values)

    current_q = q_table[state][key]
    q_table[state][key] = current_q + LEARNING_RATE * (reward + (GAMMA * max_next_q) - current_q )






def play_training_game():
    global epsilon
    board  = ['']*9
    moves = []
    player = 'X'
    turn = 0
    max_turns = 200 

    while turn < max_turns:
        turn +=1

        if count_pieces(board , player ) >=3:
            phase = 'move'
        else:
            phase = 'place'

        state = get_state(board , phase , player )
        available = get_available_actions(board , phase , player)
        action = choose_action(state , available)


        board_before = board.copy()

        moves.append({
            "state" : state,
            'action' : action,
            'player' : player,
            'board' : board_before,
            'available' : available
        })


        if  action[0] == 'place':
            board[action[1]] = player
        else:
            board[action[1]] = ''
            board[action[2]] = player

        
        if check_winner(board , player):
            for i in range(len(moves) -1 , -1 , -1 ):
                move = moves[i]
                if move['player'] == player:
                    reward = 1.0
                else:
                    reward = -1.0

                if  i < len(moves) -1:
                    next_state = moves[i+1]['state']
                    next_avail  = moves[i+1]['available']
                else:
                    next_state = ''
                    next_avail = []

                update_q_value(move['state'] , move['action'] , reward , next_state , next_avail )
            break

        if player == 'X':
            opponent = 'O'
        else:
            opponent = 'X'

        if count_pieces(board_before , opponent) >=3:
            opponent_phase = 'move'
        else :
            opponent_phase = 'place'
        
        opponent_actions = get_available_actions(board_before , opponent_phase , opponent)
        if get_winning_move_tuples(board_before , opponent_actions , opponent):
            temp = board_before.copy()
            
            
            if action[0] == 'place':
               temp[action[1]] = player
            else:
               temp[action[1]] = ''
               temp[action[2]] = player

            opponent_actions_after = get_available_actions(temp , opponent_phase , opponent)
            if get_winning_move_tuples(temp , opponent_actions_after , opponent):
                update_q_value(state , action , -0.8,  '' , [])
            
        if player == 'X':
            player = 'O'
        else:
            player = 'X'
    
    epsilon = max(EPSILON_END, epsilon - EPSILON_DECAY)





def train():
    print(f"Training for {TRAINING_GAMES} : games...")

    for game in range(1, TRAINING_GAMES + 1):
        play_training_game()

        if game % 5000 == 0:
            pct = game * 100 // TRAINING_GAMES
            print(f"  {game:>9,} / {TRAINING_GAMES:,} ({pct:>3}%) | states: {len(q_table):,} | e: {epsilon:.4f}")

    print(f"\nTraining complete! Learned {len(q_table):,} states")


def save_q_table(filename='q_table.json'):
    with open(filename, 'w') as f:
        json.dump(q_table, f, indent=2)

    print(f"Saved to {filename}")




if __name__ == "__main__":
    train()
    save_q_table()














