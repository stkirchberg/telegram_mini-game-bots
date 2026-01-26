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
const p1Label = document.getElementById('p1-label');
const p2Label = document.getElementById('p2-label');

let player1Name = "Player 1";
let player2Name = "Player 2";

let board = new Map();
let moves = [];
let currentPlayer = 1; 
let gameOver = false;
let winningLine = [];

function key(x, y) { return x + ',' + y; }
function parseKey(k) { const [a, b] = k.split(','); return { x: +a, y: +b }; }

function status(t) { statusEl.textContent = t; }



document.getElementById('start-game-btn').addEventListener('click', () => {
  const name1 = document.getElementById('p1-input').value.trim();
  const name2 = document.getElementById('p2-input').value.trim();
  
  if (name1) player1Name = name1;
  if (name2) player2Name = name2;
  
  p1Label.textContent = player1Name;
  p2Label.textContent = player2Name;
  
  document.getElementById('name-modal').style.display = 'none';
  resetGame();
});

function resetGame() {
  board.clear();
  moves = [];
  gameOver = false;
  currentPlayer = 1;
  offsetX = 0;
  offsetY = 0;
  zoom = 1;
  winningLine = [];
  status(`${player1Name}'s turn (Red)`);
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
      if (board.has(k)) {
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
    g.addColorStop(0, '#8B0000');
    g.addColorStop(1, '#FF0000');
    ctx.fillStyle = g;
  } else {
    const g = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
    g.addColorStop(1, '#00f7ffff');
    g.addColorStop(0, '#004488ff');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#202020ff';
    ctx.lineWidth = 1;
  }

  ctx.fill();
  if (player === -1) ctx.stroke();
  ctx.restore();
}

document.getElementById('mode-switch').addEventListener('click', ()=>{
  document.body.classList.toggle('light-mode');
  draw();
});

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
  return { x: Math.floor((x - left)/cs) + startX, y: Math.floor((y - top)/cs) + startY };
}

canvas.addEventListener('pointerdown', e => { 
  canvas.setPointerCapture(e.pointerId); 
  dragStart = { x:e.clientX, y:e.clientY, ox:offsetX, oy:offsetY }; 
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
  if(!dragStart) return; 
  const moved = Math.hypot(e.clientX-dragStart.x,e.clientY-dragStart.y)>6; 
  if(!moved){ 
    const c = screenToCell(e.clientX,e.clientY); 
    handleMove(c.x,c.y); 
  } 
  dragStart = null; 
});

canvas.addEventListener('wheel', e=>{ 
  e.preventDefault(); 
  zoom *= e.deltaY<0?1.1:0.9; 
  zoom=Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,zoom)); 
  draw(); }, 
  {passive:false});

function handleMove(x, y) {
  if(gameOver){status('Game Over!'); return;}
  const k=key(x,y); 
  if(board.has(k)){status('Field occupied!'); return;}
  
  setStone(x,y,currentPlayer,true);
  
  const winLine=checkWinLine(x,y,currentPlayer); 
  if(winLine){
    gameOver=true; 
    winningLine=winLine; 
    status(`${currentPlayer === 1 ? player1Name : player2Name} wins!`); 
    draw(); 
    return;
  }

  currentPlayer = currentPlayer === 1 ? -1 : 1;
  status(`${currentPlayer === 1 ? player1Name : player2Name}'s turn`);
  draw();
}

function checkWinLine(x,y,player){
  const dirs=[[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    let line=[{x,y}];
    for(let s=1;s<100;s++){ if(board.get(key(x+dx*s,y+dy*s))===player) line.push({x:x+dx*s,y:y+dy*s}); else break; }
    for(let s=1;s<100;s++){ if(board.get(key(x-dx*s,y-dy*s))===player) line.unshift({x:x-dx*s,y:y-dy*s}); else break; }
    if(line.length>=5) return line.slice(0,5);
  }
  return null;
}

document.getElementById('new').addEventListener('click', () => {
  document.getElementById('name-modal').style.display = 'flex';
});

function resizeCanvas() {
  const wrap = document.getElementById('board-wrap');
  const size = Math.min(wrap.clientWidth-20, window.innerHeight-160);
  canvas.width = canvas.height = Math.max(320, Math.min(900, size));
  cellSize = Math.max(34, Math.floor(canvas.width / 15));
  draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const ZOOM_STEP = 1.15;
document.getElementById('zoom-in').addEventListener('click', () => {
  zoom *= ZOOM_STEP;
  zoom = Math.min(MAX_ZOOM, zoom);
  draw();
});
document.getElementById('zoom-out').addEventListener('click', () => {
  zoom /= ZOOM_STEP;
  zoom = Math.max(MIN_ZOOM, zoom);
  draw();
});