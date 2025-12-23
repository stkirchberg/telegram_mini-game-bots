const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d', { alpha: false });

let cellSize = 44;
let zoom = 1;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.6;

let offsetX = 0, offsetY = 0;
let dragStart = null;
let lastTouchDistance = null;

let gridSizeX, gridSizeY, halfX, halfY;

const statusEl = document.getElementById('status');

let board = new Map();
let moves = [];
let currentPlayer = 1;
let gameOver = false;
let winningLine = [];

ctx.fillStyle = getCSSVar('--bgc');
ctx.fillRect(0, 0, canvas.width, canvas.height);

function key(x, y) { return x + ',' + y; }
function parseKey(k) { const [a, b] = k.split(','); return { x: +a, y: +b }; }

function status(t) { statusEl.textContent = t; }

function resetGame() {
  board.clear();
  moves = [];
  gameOver = false;
  currentPlayer = 1;
  offsetX = 0;
  offsetY = 0;
  zoom = 1;
  winningLine = [];
  status('Your turn - tap to place a stone');
  draw();
}

function setStone(x, y, player, record = true) {
  board.set(key(x, y), player);
  if (record) moves.push({ x, y, player });
}

function computeViewport() {
  const cs = cellSize * zoom;
  gridSizeX = Math.floor(canvas.width / cs);
  gridSizeY = Math.floor(canvas.height / cs);
  if (gridSizeX % 2 === 0) gridSizeX--;
  if (gridSizeY % 2 === 0) gridSizeY--;
  halfX = Math.floor(gridSizeX / 2);
  halfY = Math.floor(gridSizeY / 2);
}

function getCSSVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

/* ================= DRAWING ================= */
function draw() {
  computeViewport();
  const cs = cellSize * zoom;
  ctx.fillStyle = getCSSVar('--bgc');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const startX = offsetX - halfX;
  const startY = offsetY - halfY;
  const left = (canvas.width - gridSizeX * cs) / 2;
  const top = (canvas.height - gridSizeY * cs) / 2;

  ctx.strokeStyle = getCSSVar('--grid');
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSizeX; i++) {
    const x = left + i * cs;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + gridSizeY * cs);
    ctx.stroke();
  }
  for (let j = 0; j <= gridSizeY; j++) {
    const y = top + j * cs;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(left + gridSizeX * cs, y);
    ctx.stroke();
  }

  for (let gx = startX; gx <= offsetX + halfX; gx++) {
    for (let gy = startY; gy <= offsetY + halfY; gy++) {
      const k = key(gx, gy);
      if (!board.has(k)) continue;

      const player = board.get(k);
      const cx = left + ((gx - startX) + 0.5) * cs;
      const cy = top + ((gy - startY) + 0.5) * cs;

      if (winningLine.some(p => p.x === gx && p.y === gy)) {
        ctx.fillStyle = 'gold';
        ctx.fillRect(cx - cs / 2, cy - cs / 2, cs, cs);
      }

      const lastMove = moves[moves.length - 1];
      if (lastMove && lastMove.x === gx && lastMove.y === gy) {
        ctx.save();
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - cs / 2 + 1.5, cy - cs / 2 + 1.5, cs - 3, cs - 3);
        ctx.restore();
      }

      drawStone(cx, cy, player, cs);
    }
  }
}

function drawStone(cx, cy, player, cs) {
  const r = cs * 0.36;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx + 1, cy + 2, r + 1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);

  if (player === 1) {
    const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#156900');
    g.addColorStop(1, '#2cdb00');
    ctx.fillStyle = g;
  } else {
    const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#004488');
    g.addColorStop(1, '#00f7ff');
    ctx.fillStyle = g;
  }

  ctx.fill();
  ctx.restore();
}

/* ================= INPUT ================= */
function screenToCell(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  computeViewport();
  const cs = cellSize * zoom;
  const startX = offsetX - halfX;
  const startY = offsetY - halfY;
  const left = (canvas.width - gridSizeX * cs) / 2;
  const top = (canvas.height - gridSizeY * cs) / 2;
  return {
    x: Math.floor((x - left) / cs) + startX,
    y: Math.floor((y - top) / cs) + startY
  };
}

canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  dragStart = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
});

canvas.addEventListener('pointermove', e => {
  if (!dragStart) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  offsetX = dragStart.ox - Math.round(dx / (cellSize * zoom));
  offsetY = dragStart.oy - Math.round(dy / (cellSize * zoom));
  draw();
});

canvas.addEventListener('pointerup', e => {
  canvas.releasePointerCapture(e.pointerId);
  if (!dragStart) return;
  const moved = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 6;
  if (!moved) {
    const c = screenToCell(e.clientX, e.clientY);
    handlePlayerMove(c.x, c.y);
  }
  dragStart = null;
});

/* ================= GAME ================= */
function handlePlayerMove(x, y) {
  if (gameOver) return;
  if (board.has(key(x, y))) return;

  setStone(x, y, 1, true);
  const win = checkWinLine(x, y, 1);
  if (win) {
    winningLine = win;
    gameOver = true;
    status('You won — congratulations!');
    draw();
    return;
  }
  draw();
  status('thinking...');
  setTimeout(aiMove, 200);
}

/* ================= COMPUTER MINIMAX 5 ZÜGE ================= */
function aiMove() {
  if (gameOver) return;
  if (!board.size) {
    setStone(0, 0, -1, true);
    draw();
    status('Your turn');
    return;
  }

  const bestMove = minimax(5, -Infinity, Infinity, -1).move; // Tiefe 5
  if (bestMove) setStone(bestMove.x, bestMove.y, -1, true);

  const win = bestMove ? checkWinLine(bestMove.x, bestMove.y, -1) : null;
  if (win) {
    winningLine = win;
    gameOver = true;
    status('The computer won');
  } else {
    status('Your turn');
  }
  draw();
}

function minimax(depth, alpha, beta, player) {
  const winner = checkFullWin();
  if (winner === -1) return { score: 1000000 };
  if (winner === 1) return { score: -1000000 };
  if (depth === 0) return { score: evaluateBoard() };

  let bestMove = null;
  const candidates = collectCandidates(2);

  if (player === -1) {
    let maxEval = -Infinity;
    for (const move of candidates) {
      board.set(key(move.x, move.y), player);
      const evalScore = minimax(depth - 1, alpha, beta, 1).score;
      board.delete(key(move.x, move.y));
      if (evalScore > maxEval) { maxEval = evalScore; bestMove = move; }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (const move of candidates) {
      board.set(key(move.x, move.y), player);
      const evalScore = minimax(depth - 1, alpha, beta, -1).score;
      board.delete(key(move.x, move.y));
      if (evalScore < minEval) { minEval = evalScore; bestMove = move; }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

function checkFullWin() {
  for (const k of board.keys()) {
    const { x, y } = parseKey(k);
    const player = board.get(k);
    if (checkWinLine(x, y, player)) return player;
  }
  return null;
}

function evaluateBoard() {
  let score = 0;
  for (const k of board.keys()) {
    const { x, y } = parseKey(k);
    const player = board.get(k);
    for (const [dx, dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
      const info = scanLine(x, y, dx, dy, player);
      let lineScore = info.count ** 2;
      if (info.open === 2) lineScore *= 3;
      else if (info.open === 1) lineScore *= 1.5;
      score += (player === -1 ? 1 : -1) * lineScore;
    }
  }
  return score;
}

/* ================= ANALYSIS ================= */
function collectCandidates(r) {
  const set = new Set();
  for (const k of board.keys()) {
    const p = parseKey(k);
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const kk = key(p.x + dx, p.y + dy);
        if (!board.has(kk)) set.add(kk);
      }
    }
  }
  return [...set].map(parseKey);
}

function scanLine(x, y, dx, dy, player) {
  let count = 1, open = 0;
  for (let s = 1; s < 5; s++) {
    const v = board.get(key(x + dx * s, y + dy * s));
    if (v === player) count++;
    else { if (v === undefined) open++; break; }
  }
  for (let s = 1; s < 5; s++) {
    const v = board.get(key(x - dx * s, y - dy * s));
    if (v === player) count++;
    else { if (v === undefined) open++; break; }
  }
  return { count, open };
}

function checkWinLine(x, y, player) {
  for (const [dx, dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
    let line = [{ x, y }];
    for (let s = 1; s < 100; s++) {
      if (board.get(key(x + dx * s, y + dy * s)) === player)
        line.push({ x: x + dx * s, y: y + dy * s });
      else break;
    }
    for (let s = 1; s < 100; s++) {
      if (board.get(key(x - dx * s, y - dy * s)) === player)
        line.unshift({ x: x - dx * s, y: y - dy * s });
      else break;
    }
    if (line.length >= 5) return line.slice(0, 5);
  }
  return null;
}

/* ================= UI ================= */
document.getElementById('new').addEventListener('click', resetGame);

function resizeCanvas() {
  const wrap = document.getElementById('board-wrap');
  const size = Math.min(wrap.clientWidth - 20, window.innerHeight - 160);
  canvas.width = canvas.height = Math.max(320, Math.min(900, size));
  cellSize = Math.max(34, Math.floor(canvas.width / 15));
  draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
resetGame();
