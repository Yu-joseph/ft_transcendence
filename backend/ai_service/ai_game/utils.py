
def check_winner(board, player):
    wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ]
    for w in wins:
        if board[w[0]] == player and board[w[1]] == player and board[w[2]] == player :
            return  True
    return False


def get_state(board  , phase , player):
    chars = []
    for cell in board:
        if cell:
            chars.append(cell)
        else:
            chars.append('-')

    board_str = ''.join(chars)
    return board_str + "_" + phase + "_" + player




def get_available_actions(board, phase, player):
    actions = []
    if phase == 'place':
        for i in range(len(board)) :
            if board[i] == '':
                actions.append(('place' , i))
        return actions
        
    my_pieces = []
    empty = []

    for  i in range(len(board)):
        if board[i] == player :
            my_pieces.append(i)
        elif board[i] == '':
            empty.append(i)

    for frm in my_pieces:
        for to in empty:
            actions.append(('move' , frm , to))

    return actions




def action_to_key(action):
    if action[0] == 'place':
        return f"p{action[1]}"
    else:
        return f"m{action[1]}_{action[2]}"


