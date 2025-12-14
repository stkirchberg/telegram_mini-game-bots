const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d', { alpha: false });

let cellSize = 44;
let zoom = 1;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.5;

let offsetX = 0, offsetY = 0;
let dragStart = null;

let gridSizeX, gridSizeY, halfX, halfY;

const statusEl = document.getElementById('status');
const difficultyEl = document.getElementById('difficulty');

let board = new Map();
let moves = [];
let currentPlayer = 1;
let gameOver = false;

function key(x, y) { return x + ',' + y; }
function parseKey(k) {
  const [a, b] = k.split(',');
  return { x: +a, y: +b };
}

function status(t) {
  statusEl.textContent = t;
}

function resetGame() {
  board.clear();
  moves = [];
  gameOver = false;
  currentPlayer = 1;
  offsetX = 0;
  offsetY = 0;
  zoom = 1;
  status('Your turn');
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

function draw() {
  computeViewport();
  const cs = cellSize * zoom;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const startX = offsetX - halfX;
  const startY = offsetY - halfY;

  const left = (canvas.width - gridSizeX * cs) / 2;
  const top = (canvas.height - gridSizeY * cs) / 2;

  ctx.strokeStyle = '#bfc7cf';
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

      const cx = left + ((gx - startX) + 0.5) * cs;
      const cy = top + ((gy - startY) + 0.5) * cs;
      drawStone(cx, cy, board.get(k), cs);
    }
  }

  if (moves.length > 0) {
    const last = moves[moves.length - 1];
    if (Math.abs(last.x - offsetX) <= halfX &&
        Math.abs(last.y - offsetY) <= halfY) {

      const cx = left + ((last.x - startX) + 0.5) * cs;
      const cy = top + ((last.y - startY) + 0.5) * cs;

      ctx.strokeStyle = '#ffcf66';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, cs * 0.36, 0, Math.PI * 2);
      ctx.stroke();
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
    g.addColorStop(0, '#333');
    g.addColorStop(1, '#000');
    ctx.fillStyle = g;
  } else {
    const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
    g.addColorStop(0, '#fff');
    g.addColorStop(1, '#e6e9ec');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#cfcfcf';
  }

  ctx.fill();
  if (player === -1) ctx.stroke();
  ctx.restore();
}

function screenToCell(x, y) {
  const rect = canvas.getBoundingClientRect();
  const cs = cellSize * zoom;
  computeViewport();

  const left = (canvas.width - gridSizeX * cs) / 2;
  const top = (canvas.height - gridSizeY * cs) / 2;

  const gx = Math.floor((x - rect.left - left) / cs) + offsetX - halfX;
  const gy = Math.floor((y - rect.top - top) / cs) + offsetY - halfY;

  return { x: gx, y: gy };
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

canvas.addEventListener('wheel', e => {
  e.preventDefault();
  zoom *= e.deltaY < 0 ? 1.1 : 0.9;
  zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
  draw();
}, { passive: false });

function handlePlayerMove(x, y) {
  if (gameOver) return;
  if (board.has(key(x, y))) return;

  setStone(x, y, 1);
  draw();

  if (checkWin(x, y, 1)) {
    gameOver = true;
    status('You won!');
    return;
  }

  status('thinking…');
  setTimeout(aiMove, 60);
}

function aiMove() {
  const last = moves[moves.length - 1] || { x: 0, y: 0 };
  setStone(last.x + 1, last.y, -1);
  draw();

  if (checkWin(last.x + 1, last.y, -1)) {
    gameOver = true;
    status('Computer won.');
  } else {
    status('Your turn');
  }
}

function checkWin(x, y, player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dx, dy] of dirs) {
    let count = 1;
    for (let i = 1; i < 5; i++) if (board.get(key(x + dx*i, y + dy*i)) === player) count++; else break;
    for (let i = 1; i < 5; i++) if (board.get(key(x - dx*i, y - dy*i)) === player) count++; else break;
    if (count >= 5) return true;
  }
  return false;
}

function resizeCanvas() {
  const wrap = document.getElementById('board-wrap');
  const size = Math.min(wrap.clientWidth - 20, window.innerHeight - 160);
  canvas.width = canvas.height = Math.max(320, Math.min(900, size));
  cellSize = Math.floor(canvas.width / 15);
  draw();
}

window.addEventListener('resize', resizeCanvas);
document.getElementById('new').addEventListener('click', resetGame);

resizeCanvas();
resetGame();
