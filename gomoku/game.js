const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d', { alpha: false });
let cellSize = 44;
let gridSize = 15;
let halfView = 7;
let offsetX = 0, offsetY = 0;
let lastMouse = null;

const statusEl = document.getElementById('status');
const difficultyEl = document.getElementById('difficulty');

let board = new Map();
let moves = [];
let currentPlayer = 1;
let gameOver = false;

function key(x,y){return x+','+y;}
function parseKey(k){const [a,b]=k.split(',');return {x:+a,y:+b};}

function resetGame(){
  board.clear(); moves = []; gameOver = false; currentPlayer = 1;
  offsetX = 0; offsetY = 0;
  status('Your turn');
  draw();
}

function status(t){ statusEl.textContent = t; }

function setStone(x,y,player,record=true){
  board.set(key(x,y), player);
  if(record) moves.push({x,y,player});
}

function undo(){
  if(moves.length===0) return;
  const last = moves.pop();
  board.delete(key(last.x,last.y));
  if(moves.length>0 && last.player===-1 && moves[moves.length-1].player===1){
    const pl = moves.pop();
    board.delete(key(pl.x,pl.y));
  }
  gameOver=false;
  status('Rückgängig — dein Zug');
  draw();
}

function computeViewport(){
  const w = canvas.width, h = canvas.height;
  gridSizeX = Math.floor(w / cellSize);
  gridSizeY = Math.floor(h / cellSize);
  gridSizeX += (gridSizeX%2===0)?-1:0;
  gridSizeY += (gridSizeY%2===0)?-1:0;
  halfX = Math.floor(gridSizeX/2);
  halfY = Math.floor(gridSizeY/2);
}

function draw(){
  computeViewport();
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  const startX = offsetX - halfX;
  const startY = offsetY - halfY;

  ctx.strokeStyle = '#bfc7cf';
  ctx.lineWidth = 1;
  for(let i=0;i<=gridSizeX;i++){
    const x = i*cellSize + (canvas.width - gridSizeX*cellSize)/2;
    ctx.beginPath(); ctx.moveTo(x, (canvas.height - gridSizeY*cellSize)/2); ctx.lineTo(x, (canvas.height + gridSizeY*cellSize)/2); ctx.stroke();
  }
  for(let j=0;j<=gridSizeY;j++){
    const y = j*cellSize + (canvas.height - gridSizeY*cellSize)/2;
    ctx.beginPath(); ctx.moveTo((canvas.width - gridSizeX*cellSize)/2, y); ctx.lineTo((canvas.width + gridSizeX*cellSize)/2, y); ctx.stroke();
  }

  for(let gx = startX; gx <= offsetX + halfX; gx++){
    for(let gy = startY; gy <= offsetY + halfY; gy++){
      const k = key(gx,gy);
      if(board.has(k)){
        const player = board.get(k);
        const cx = ( (gx - startX) + 0.5) * cellSize + (canvas.width - gridSizeX*cellSize)/2;
        const cy = ( (gy - startY) + 0.5) * cellSize + (canvas.height - gridSizeY*cellSize)/2;
        drawStone(cx, cy, player);
      }
    }
  }

  if(moves.length>0){
    const last = moves[moves.length-1];
    if(Math.abs(last.x - offsetX) <= halfX && Math.abs(last.y - offsetY) <= halfY){
      const cx = ((last.x - startX)+0.5)*cellSize + (canvas.width - gridSizeX*cellSize)/2;
      const cy = ((last.y - startY)+0.5)*cellSize + (canvas.height - gridSizeY*cellSize)/2;
      ctx.strokeStyle = '#ffcf66';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx,cy,cellSize*0.36,0,Math.PI*2);
      ctx.stroke();
    }
  }
}

function drawStone(cx,cy,player){
    const r = cellSize*0.36;
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx+1,cy+2,r+1,0,Math.PI*2);
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  if(player===1){
    const g = ctx.createRadialGradient(cx-calcOffset(),cy-calcOffset(),r*0.1,cx,cy,r);
    g.addColorStop(0,'#333');
    g.addColorStop(1,'#000');
    ctx.fillStyle = g;
  } else {
    const g = ctx.createRadialGradient(cx-calcOffset(),cy-calcOffset(),r*0.1,cx,cy,r);
    g.addColorStop(0,'#ffffff');
    g.addColorStop(1,'#e6e9ec');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#cfcfcf';
    ctx.lineWidth = 1;
  }
  ctx.fill();
  if(player===-1) ctx.stroke();
  ctx.restore();

  function calcOffset(){ return Math.max(1, r*0.15); }
}

function screenToCell(clientX,clientY){
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  computeViewport();
  const startX = offsetX - halfX;
  const startY = offsetY - halfY;
  const gridLeft = (canvas.width - gridSizeX*cellSize)/2;
  const gridTop  = (canvas.height - gridSizeY*cellSize)/2;
  const gx = Math.floor((x - gridLeft) / cellSize) + startX;
  const gy = Math.floor((y - gridTop) / cellSize) + startY;
  return {x:gx,y:gy};
}

canvas.addEventListener('pointerdown', e=>{
  canvas.setPointerCapture(e.pointerId);
  dragStart = {x:e.clientX, y:e.clientY, ox:offsetX, oy:offsetY};
  lastMouse = {x:e.clientX,y:e.clientY};
});

canvas.addEventListener('pointermove', e=>{
  if(!dragStart) return;
  const dx = e.clientX - dragStart.x;
  const dy = e.clientY - dragStart.y;
  const shiftX = -Math.round(dx / cellSize);
  const shiftY = -Math.round(dy / cellSize);
  offsetX = dragStart.ox + shiftX;
  offsetY = dragStart.oy + shiftY;
  draw();
});

canvas.addEventListener('pointerup', e=>{
  canvas.releasePointerCapture(e.pointerId);
  if(!dragStart){ return; }
  const moved = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y) > 6;
  if(!moved){
    const c = screenToCell(e.clientX, e.clientY);
    handlePlayerMove(c.x, c.y);
  }
  dragStart = null;
  draw();
});

canvas.addEventListener('contextmenu', e=>e.preventDefault());

function handlePlayerMove(x,y){
  if(gameOver){ status('Game over - start a new game'); return; }
  const k = key(x,y);
  if(board.has(k)) { status('Field occupied'); return; }
  setStone(x,y,1,true);
  draw();
  if(checkWin(x,y,1)){
    gameOver = true; status('You won! 🎉'); return;
  }
 
  currentPlayer = -1;
  status('thinking...');
  setTimeout(()=>{ aiMove(); }, 70);
}

function aiMove(){
  if(gameOver) return;
  const difficulty = difficultyEl.value;
  const R = difficulty==='easy'?2: difficulty==='normal'?3:4;
  const candidates = new Set();
  if(board.size === 0){
    setStone(0,0,-1,true); checkAfterAi(0,0); return;
  }
  for(const k of board.keys()){
    const p = parseKey(k);
    for(let dx=-R; dx<=R; dx++){
      for(let dy=-R; dy<=R; dy++){
        const nx = p.x + dx, ny = p.y + dy;
        const kk = key(nx,ny);
        if(!board.has(kk)) candidates.add(kk);
      }
    }
  }

  for(const kk of candidates){
    const {x,y} = parseKey(kk);
    board.set(kk,-1);
    const win = checkWin(x,y,-1,true);
    board.delete(kk);
    if(win){
      setStone(x,y,-1,true); checkAfterAi(x,y); return;
    }
  }

  for(const kk of candidates){
    const {x,y} = parseKey(kk);
    board.set(kk,1);
    const win = checkWin(x,y,1,true);
    board.delete(kk);
    if(win){
      setStone(x,y,-1,true); checkAfterAi(x,y); return;
    }
  }

  let best = null;
  let bestScore = -Infinity;
  for(const kk of candidates){
    const {x,y} = parseKey(kk);
    const score = evaluateCell(x,y,difficulty);
    if(score > bestScore){
      bestScore = score; best = {x,y,score};
    }
  }
  if(!best){
    const last = moves[moves.length-1] || {x:0,y:0};
    const nx = last.x + (Math.random()*3|0)-1;
    const ny = last.y + (Math.random()*3|0)-1;
    setStone(nx,ny,-1,true); checkAfterAi(nx,ny); return;
  }
  setStone(best.x,best.y,-1,true);
  checkAfterAi(best.x,best.y);
}

function checkAfterAi(x,y){
  draw();
  if(checkWin(x,y,-1)){
    gameOver = true; status('The computer won.'); return;
  }
  currentPlayer = 1;
  status('Your turn');
}

function checkWin(x,y,player,shortCircuit=false){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    let cnt = 1;
    for(let s=1;s<100;s++){
      if(board.get(key(x+dx*s,y+dy*s))===player) cnt++; else break;
    }
    for(let s=1;s<100;s++){
      if(board.get(key(x-dx*s,y-dy*s))===player) cnt++; else break;
    }
    if(cnt>=5) return true;
  }
  return false;
}


function evaluateCell(x,y,difficulty){
  const me = -1; const opp = 1;
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  let score = 0;
  for(const [dx,dy] of dirs){
    const lineMe = countLine(x,y,dx,dy,me);
    const lineOpp = countLine(x,y,dx,dy,opp);
    score += scoreForLine(lineMe, true);
    score += scoreForLine(lineOpp, false) * 0.9;
  }

  score -= (Math.abs(x) + Math.abs(y)) * (difficulty==='easy'?0.02: difficulty==='normal'?0.01:0.005);
  score += Math.random()*0.1;
  return score;

  function countLine(cx,cy,dx,dy,player){

    let count = 1;
    let leftOpen = 0, rightOpen = 0;

    for(let s=1;s<10;s++){
      const v = board.get(key(cx+dx*s, cy+dy*s));
      if(v===player) count++; else { if(v===undefined) rightOpen=1; break; }
    }
    for(let s=1;s<10;s++){
      const v = board.get(key(cx-dx*s, cy-dy*s));
      if(v===player) count++; else { if(v===undefined) leftOpen=1; break; }
    }
    return {count, openEnds: leftOpen + rightOpen};
  }
  function scoreForLine(line, isMe){
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
}

document.querySelectorAll('.pan-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    const dx = parseInt(b.dataset.dx0), dy=parseInt(b.dataset.dy0);
    offsetX += dx * Math.max(1, Math.floor((gridSizeX||15)/3));
    offsetY += dy * Math.max(1, Math.floor((gridSizeY||15)/3));
    draw();
  });
});
document.getElementById('center').addEventListener('click', ()=>{ offsetX=0; offsetY=0; draw(); });

document.getElementById('new').addEventListener('click', ()=>resetGame());
document.getElementById('undo').addEventListener('click', ()=>undo());

function resizeCanvas(){
  const wrap = document.getElementById('board-wrap');
  const rect = wrap.getBoundingClientRect();
  const size = Math.min(rect.width-20, window.innerHeight - 160);
  const s = Math.max(320, Math.min(900, Math.floor(size)));
  canvas.width = s;
  canvas.height = s;
  cellSize = Math.max(34, Math.floor(canvas.width / 15));
  draw();
}
window.addEventListener('resize', ()=>{ resizeCanvas(); });
resizeCanvas();
resetGame();

window.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowLeft'){ offsetX -= 2; draw();}
  if(e.key==='ArrowRight'){ offsetX += 2; draw();}
  if(e.key==='ArrowUp'){ offsetY -= 2; draw();}
  if(e.key==='ArrowDown'){ offsetY += 2; draw();}
});