const cells = document.querySelectorAll('.cell');
const status = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');
const labelX = document.getElementById('label-x');
const labelO = document.getElementById('label-o');
const inputX = document.getElementById('name-x');
const inputO = document.getElementById('name-o');

const WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let board = Array(9).fill('');
let currentPlayer = 'X';
let gameOver = false;
let scores = { X: 0, O: 0, draw: 0 };

function getName(player) {
  const val = player === 'X' ? inputX.value.trim() : inputO.value.trim();
  return val || `Joueur ${player}`;
}

function updateLabels() {
  labelX.textContent = inputX.value.trim() || 'X';
  labelO.textContent = inputO.value.trim() || 'O';
}

function checkWinner() {
  for (const [a, b, c] of WINS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo: [a, b, c] };
    }
  }
  if (board.every(cell => cell !== '')) return { winner: 'draw' };
  return null;
}

function handleClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (board[index] || gameOver) return;

  board[index] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add('taken', currentPlayer.toLowerCase());

  const result = checkWinner();

  if (result) {
    gameOver = true;
    if (result.winner === 'draw') {
      status.textContent = 'Égalité !';
      scores.draw++;
      scoreDraw.textContent = scores.draw;
    } else {
      status.textContent = `${getName(result.winner)} gagne !`;
      result.combo.forEach(i => cells[i].classList.add('win'));
      scores[result.winner]++;
      if (result.winner === 'X') scoreX.textContent = scores.X;
      else scoreO.textContent = scores.O;
    }
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    status.textContent = `Tour de ${getName(currentPlayer)}`;
  }
}

function restart() {
  board = Array(9).fill('');
  gameOver = false;
  currentPlayer = 'X';
  status.textContent = `Tour de ${getName('X')}`;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });
}

inputX.addEventListener('input', () => {
  updateLabels();
  if (!gameOver) status.textContent = `Tour de ${getName(currentPlayer)}`;
});
inputO.addEventListener('input', () => {
  updateLabels();
  if (!gameOver) status.textContent = `Tour de ${getName(currentPlayer)}`;
});

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', restart);
