const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d', { alpha: false });

let cellSize = 44;
let zoom = 1;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.6;

let offsetX = 0, offsetY = 0;
let dragStart = null;

let gridSizeX, gridSizeY, halfX, halfY;

const statusEl = document.getElementById('status');
const difficultyEl = document.getElementById('difficulty');

let board = new Map();
let moves = [];
let currentPlayer = 1;
let gameOver = false;
let winningLine = [];

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
  status('Dein Zug — tippe ein Feld');
  draw();
}

function setStone(x, y, player, record = true) {
  board.set(key(x, y), player);
  if (record) moves.push({ x, y, player });
}

function undo() {
  if (!moves.length) return;
  const last = moves.pop();
  board.delete(key(last.x, last.y));
  if (moves.length && last.player === -1 && moves[moves.length - 1].player === 1) {
    const pl = moves.pop();
    board.delete(key(pl.x, pl.y));
  }
  gameOver = false;
  winningLine = [];
  status('Rückgängig — dein Zug');
  draw();
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
      if (board.has(k)) {
        const player = board.get(k);
        const cx = left + ((gx - startX) + 0.5) * cs;
        const cy = top + ((gy - startY) + 0.5) * cs;
        if (winningLine.some(p => p.x === gx && p.y === gy)) {
          ctx.fillStyle = 'gold';
          ctx.fillRect(cx - cs / 2, cy - cs / 2, cs, cs);
        }
        drawStone(cx, cy, player, cs);
      }
    }
  }

  if (moves.length > 0) {
    const last = moves[moves.length - 1];
    if (Math.abs(last.x - offsetX) <= halfX && Math.abs(last.y - offsetY) <= halfY) {
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
    ctx.lineWidth = 1;
  }
  ctx.fill();
  if (player === -1) ctx.stroke();
  ctx.restore();
}

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
  const gx = Math.floor((x - left) / cs) + startX;
  const gy = Math.floor((y - top) / cs) + startY;
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
  if (gameOver) { status('Spiel vorbei — neues Spiel starten'); return; }
  const k = key(x, y);
  if (board.has(k)) { status('Feld besetzt'); return; }
  setStone(x, y, 1, true);
  const winLine = checkWinLine(x, y, 1);
  if (winLine) { gameOver = true; winningLine = winLine; status('Gewonnen! 🎉'); draw(); return; }
  currentPlayer = -1;
  status('thinking...');
  setTimeout(aiMove, 70);
}

function aiMove() {
  if (gameOver) return;
  const difficulty = difficultyEl.value || 'normal';
  const R = difficulty === 'easy' ? 2 : difficulty === 'normal' ? 3 : 4;
  const candidates = new Set();
  if (!board.size) { setStone(0, 0, -1, true); return; }
  for (const k of board.keys()) {
    const p = parseKey(k);
    for (let dx = -R; dx <= R; dx++) {
      for (let dy = -R; dy <= R; dy++) {
        const nx = p.x + dx, ny = p.y + dy;
        const kk = key(nx, ny);
        if (!board.has(kk)) candidates.add(kk);
      }
    }
  }
  for (const kk of candidates) {
    const { x, y } = parseKey(kk);
    board.set(kk, -1);
    const winLine = checkWinLine(x, y, -1);
    board.delete(kk);
    if (winLine) { setStone(x, y, -1, true); winningLine = winLine; gameOver = true; status('KI hat gewonnen — leider.'); draw(); return; }
  }
  for (const kk of candidates) {
    const { x, y } = parseKey(kk);
    board.set(kk, 1);
    const winLine = checkWinLine(x, y, 1);
    board.delete(kk);
    if (winLine) { setStone(x, y, -1, true); draw(); return; }
  }
  let best = null, bestScore = -Infinity;
  for (const kk of candidates) {
    const { x, y } = parseKey(kk);
    const score = evaluateCell(x, y, difficulty);
    if (score > bestScore) { bestScore = score; best = { x, y }; }
  }
  if (best) setStone(best.x, best.y, -1, true);
  const winLine = best ? checkWinLine(best.x, best.y, -1) : null;
  if (winLine) { winningLine = winLine; gameOver = true; status('KI hat gewonnen — leider.'); }
  draw();
  currentPlayer = 1;
  if (!gameOver) status('Dein Zug');
}

function checkWinLine(x, y, player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dx, dy] of dirs) {
    let line = [{x,y}];
    for (let s = 1; s < 100; s++) { if (board.get(key(x+dx*s, y+dy*s))===player) line.push({x:x+dx*s, y:y+dy*s}); else break; }
    for (let s = 1; s < 100; s++) { if (board.get(key(x-dx*s, y-dy*s))===player) line.unshift({x:x-dx*s, y:y-dy*s}); else break; }
    if (line.length >= 5) return line.slice(0,5);
  }
  return null;
}

function evaluateCell(x, y, difficulty) {
  const me = -1, opp = 1;
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  let score = 0;
  for (const [dx, dy] of dirs) {
    const lineMe = countLine(x, y, dx, dy, me);
    const lineOpp = countLine(x, y, dx, dy, opp);
    score += scoreForLine(lineMe, true);
    score += scoreForLine(lineOpp, false) * 0.9;
  }
  score -= (Math.abs(x) + Math.abs(y)) * (difficulty==='easy'?0.02: difficulty==='normal'?0.01:0.005);
  score += Math.random()*0.1;

  function countLine(cx,cy,dx,dy,player){
    let count = 1, leftOpen=0, rightOpen=0;
    for(let s=1;s<10;s++){ const v = board.get(key(cx+dx*s,cy+dy*s)); if(v===player) count++; else { if(v===undefined) rightOpen=1; break; } }
    for(let s=1;s<10;s++){ const v = board.get(key(cx-dx*s,cy-dy*s)); if(v===player) count++; else { if(v===undefined) leftOpen=1; break; } }
    return {count, openEnds:leftOpen+rightOpen};
  }
  function scoreForLine(line, isMe) {
    const c = line.count, o = line.openEnds;
    if(c>=5) return 100000;
    if(c===4 && o>0) return isMe?20000:9000;
    if(c===3 && o===2) return isMe?8000:1800;
    if(c===3 && o===1) return isMe?1200:400;
    if(c===2 && o===2) return isMe?400:80;
    if(c===2 && o===1) return isMe?60:20;
    if(c===1) return 5;
    return 0;
  }
  return score;
}

document.getElementById('new').addEventListener('click', resetGame);
document.getElementById('undo').addEventListener('click', undo);

function resizeCanvas() {
  const wrap = document.getElementById('board-wrap');
  const size = Math.min(wrap.clientWidth-20, window.innerHeight-160);
  canvas.width = canvas.height = Math.max(320, Math.min(900, size));
  cellSize = Math.max(34, Math.floor(canvas.width / 15));
  draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
resetGame();

window.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft'){ offsetX -= 2; draw();}
  if(e.key==='ArrowRight'){ offsetX += 2; draw();}
  if(e.key==='ArrowUp'){ offsetY -= 2; draw();}
  if(e.key==='ArrowDown'){ offsetY += 2; draw();}
});
