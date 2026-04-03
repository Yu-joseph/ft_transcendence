// ================================
// GAME STATE
// ================================
let board = Array(9).fill('');
let currentPlayer = 'X';
let gameActive = false;
let qTable = {};
let modelLoaded = false;
let selectedPiece = null;  // for moving phase

// ================================
// UI INIT
// ================================
function initBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.onclick = () => handleCellClick(i);
    boardEl.appendChild(cell);
  }

  updateBoard();
}

function countPieces(player) {
  return board.filter(c => c === player).length;
}

function getPhase(player) {
  return countPieces(player) < 3 ? 'place' : 'move';
}

function updateBoard() {
  const cells = document.querySelectorAll('.cell');

  cells.forEach((cell, i) => {
    cell.textContent = board[i];
    cell.className = 'cell';

    if (board[i] === 'X') cell.classList.add('x');
    if (board[i] === 'O') cell.classList.add('o');

    // Highlight selected piece
    if (selectedPiece === i) {
      cell.classList.add('selected');
    }

    // Highlight movable pieces in moving phase
    if (gameActive && currentPlayer === 'X' && getPhase('X') === 'move') {
      if (board[i] === 'X') {
        cell.classList.add('movable');
      }
    }
  });

  // Update status
  if (gameActive && currentPlayer === 'X') {
    const phase = getPhase('X');
    if (phase === 'place') {
      document.getElementById('status').textContent = `Your turn — place X (${countPieces('X')}/3)`;
    } else if (selectedPiece !== null) {
      document.getElementById('status').textContent = 'Now tap an empty square to move';
    } else {
      document.getElementById('status').textContent = 'Tap one of your X pieces to move it';
    }
  }
}

// ================================
// GAME FLOW
// ================================
function handleCellClick(index) {
  if (!gameActive || currentPlayer !== 'X') return;

  const phase = getPhase('X');

  if (phase === 'place') {
    // PLACING PHASE: put X on empty square
    if (board[index] !== '') return;
    board[index] = 'X';
    selectedPiece = null;
  } else {
    // MOVING PHASE: first select your piece, then select empty destination
    if (selectedPiece === null) {
      // Select a piece to move
      if (board[index] !== 'X') return;
      selectedPiece = index;
      updateBoard();
      return;
    } else {
      // Move to empty square
      if (board[index] !== '') {
        // Clicked another own piece? Switch selection
        if (board[index] === 'X') {
          selectedPiece = index;
          updateBoard();
          return;
        }
        return;
      }
      board[selectedPiece] = '';
      board[index] = 'X';
      selectedPiece = null;
    }
  }

  updateBoard();

  if (checkWinner('X')) {
    endGame('You win! 🎉');
    return;
  }

  currentPlayer = 'O';
  document.getElementById('status').textContent = 'AI is thinking…';
  setTimeout(aiMove, 400);
}

function aiMove() {
  if (!modelLoaded) {
    endGame('AI model not loaded');
    return;
  }

  const phase = getPhase('O');
  const state = getState(board, phase, 'O');
  const available = getAvailableActions(board, phase, 'O');

  if (available.length === 0) {
    endGame('Draw! 🤝');
    return;
  }

  const action = getBestAction(state, available);

  // Apply action
  if (action.type === 'place') {
    board[action.to] = 'O';
  } else {
    board[action.from] = '';
    board[action.to] = 'O';
  }

  updateBoard();

  if (checkWinner('O')) {
    endGame('AI wins! 🤖');
    return;
  }

  currentPlayer = 'X';
  updateBoard();
}

function resetGame() {
  if (!modelLoaded) return;

  board = Array(9).fill('');
  currentPlayer = 'X';
  gameActive = true;
  selectedPiece = null;

  updateBoard();
}

function endGame(message) {
  gameActive = false;
  selectedPiece = null;
  document.getElementById('status').textContent = message;
}

// ================================
// AI (Q-TABLE INFERENCE)
// ================================
function getState(b, phase, player) {
  const boardStr = b.map(c => c || '-').join('');
  return `${boardStr}_${phase}_${player}`;
}

function getAvailableActions(b, phase, player) {
  const actions = [];
  if (phase === 'place') {
    for (let i = 0; i < 9; i++) {
      if (b[i] === '') actions.push({ type: 'place', to: i, key: `p${i}` });
    }
  } else {
    const myPieces = [];
    const empty = [];
    for (let i = 0; i < 9; i++) {
      if (b[i] === player) myPieces.push(i);
      if (b[i] === '') empty.push(i);
    }
    for (const frm of myPieces) {
      for (const to of empty) {
        actions.push({ type: 'move', from: frm, to: to, key: `m${frm}_${to}` });
      }
    }
  }
  return actions;
}

function getBestAction(state, actions) {
  if (!qTable[state]) {
    console.warn('State not found:', state);
    return actions[Math.floor(Math.random() * actions.length)];
  }

  let bestAction = actions[0];
  let bestValue = -Infinity;

  for (const action of actions) {
    const value = qTable[state][action.key];
    if (value !== undefined && value > bestValue) {
      bestValue = value;
      bestAction = action;
    }
  }

  return bestAction;
}

// ================================
// GAME RULES
// ================================
function checkWinner(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(combo => combo.every(i => board[i] === player));
}

// ================================
// LOAD Q-TABLE
// ================================
function loadPythonAI() {
  document.getElementById('trainingStatus').textContent = 'Loading AI model…';
  document.getElementById('status').textContent = 'Please wait…';
  gameActive = false;

  fetch('/q_table.json')
    .then(res => {
      if (!res.ok) throw new Error('q_table.json missing');
      return res.json();
    })
    .then(data => {
      qTable = data;
      modelLoaded = true;
      document.getElementById('trainingStatus').textContent =
        `AI loaded (${Object.keys(qTable).length} states)`;
      resetGame();
    })
    .catch(err => {
      modelLoaded = false;
      gameActive = false;
      document.getElementById('trainingStatus').textContent = 'AI model not found';
      document.getElementById('status').textContent = 'Run train.py to generate q_table.json';
      console.error('FATAL:', err);
    });
}

// ================================
// INIT
// ================================
initBoard();
loadPythonAI();

