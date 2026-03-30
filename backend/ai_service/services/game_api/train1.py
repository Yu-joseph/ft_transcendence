import json 
import random

q_table ={}


TRAINING_GAMES= 10000
epsilon = 0.3


board = ['X', '', 'O', '', '', '', '', '', '']



def get_state(board, phase, player):
    board_str = []

    for cell in board:
        if cell =='':
            board_str.append('-')
        else:
            board_str.append(cell)
    
    state =  ''.join(board_str) + '_' + phase + '_' + player
    return state


def get_available_actions(board, phase, player):
    actions=[]

    if phase == 'place':
        for i in range(len(board)):
            if board[i] == '':
                actions.append(('place' , i))
        return actions
    
    my_pieces =[]
    empty_cells = []

    for i in range(len(board)):
        if board[i] == player:
            my_pieces.append(i)

    for j in range(len(board)):
        if board[j] == '':
            empty_cells.append(j)

    for frm in my_pieces:
        for to in empty_cells:
            actions.append(('move' , frm , to))
    
    return actions



def action_to_key(action):
    if action[0] == 'place':
        return 'p' + str(action[1])
    else:
        return 'm' +  str(action[1]) + '_' + str(action[2])
    

def init_q_state(state, actions):
    if state not in q_table :
        q_table[state] = {}
    for a in actions:
        key = action_to_key(a)
        if key not in q_table[state]:
            q_table[state][key] = 0.0





def choose_action(state, actions, force_greedy=False):
    init_q_state(state, actions)

    if not force_greedy and random.random() < epsilon:
        return random.choice(actions)

    best_action = None
    best_value = float('-inf')

    for a in actions:
        key = action_to_key(a)
        value = q_table[state][key]

        if value > best_value:
            best_value = value
            best_action = a

    return best_action


def count_pieces(board, player):
    count = 0
    for cell in board:
        if cell == player:
            count +=1
    return count


def check_winner(board , player):
    wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    for w in  wins:
        win =True
        for i in w:
            if board[i] != player:
                win = False
                break
        if win == True:
            return True
    return False


def update_q_value(state , action , reward , next_state , next_actions):





    global epsilon 
    # board = ['']*9
    board = ['X', '', 'O', '', '', '', '', '', '']

    moves =[]
    player='X'
    turn = 0
    max_turns = 5

    while turn < max_turns:
        turn +=1

        if  count_pieces(board , player) < 3:
            phase = 'place'
        else:
            phase = 'move'
        
        state = get_state(board , phase , player)
        # print(f"state = {state}")
        available = get_available_actions(board , phase , player)
        if not available :
            break
        # print(f"available = {available}")

        action = choose_action(state , available)
        # print(f"***************   {action}")

        moves.append({
            'state' : state,
            'action'  : action,
            'player' : player,
            'board' : board.copy(),
            'available' : available
        })

        # print(f"+++++++++++++++++++++++++++++  {moves}")

        if action[0] == 'place':
            board[action[1]] = player
        else:
            board[action[1]] =''
            board[action[2]] = player

        if check_winner(board , player ):
            for i in range(len(moves) -1 , -1 , -1 ) :
                move  = moves[i]
                if move['player'] == player:
                    reward = 1.0
                else:
                    reward = -1.0
                if i < len(moves) -1:
                    next_move = moves[i+1]










def    train():
    print(f"Training for {TRAINING_GAMES:,} games...")

    for game in range(1, 5):
        # print(game)
        play_training_game()





if __name__ == "__main__":
    train()