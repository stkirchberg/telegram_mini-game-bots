const canvas = document.getElementById('snake-board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');
const overlay = document.getElementById('game-over-overlay');
const deathReasonEl = document.getElementById('death-reason');
const finalStatsEl = document.getElementById('final-stats');

const gridSize = 15;
let tileCount;
let snake, food, poisonList, dx, dy, score, gameLoop, speed;
let paused = true;
let isGameOver = false;
let highScore = localStorage.getItem('snakeHighScore') || 0;

function initGame() {
    const size = Math.min(window.innerWidth - 30, 600);
    canvas.width = canvas.height = Math.floor(size / gridSize) * gridSize;
    tileCount = canvas.width / gridSize;

    snake = [{ x: Math.floor(tileCount/2), y: Math.floor(tileCount/2) }];
    poisonList = []; 
    generateFood();
    dx = 0; dy = 0;
    score = 0;
    speed = 100;
    paused = true;
    isGameOver = false;
    overlay.classList.add('hidden');
    updateScoreDisplay();
    statusEl.textContent = "Press Arrow keys or WASD to start";
    draw();
}

function resetFromModal() {
    initGame();
}

function updateScoreDisplay() {
    scoreEl.innerHTML = `Score: ${score}`;
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    if (snake.some(p => p.x === food.x && p.y === food.y) || 
        poisonList.some(p => p.x === food.x && p.y === food.y)) {
        generateFood();
    }
}

function addPoison() {
    const newPoison = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    if (snake.some(p => p.x === newPoison.x && p.y === newPoison.y) || 
        (newPoison.x === food.x && newPoison.y === food.y) ||
        poisonList.some(p => p.x === newPoison.x && p.y === newPoison.y)) {
        addPoison();
    } else {
        poisonList.push(newPoison);
    }
}

function draw() {
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bgc');
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid');
    ctx.lineWidth = 0.5;
    for(let i=0; i<canvas.width; i+=gridSize) {
        ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(canvas.width,i); ctx.stroke();
    }

    snake.forEach((part, index) => {
        if (index === 0) {
            ctx.fillStyle = '#33b33a'; 
        } else if (score >= 1000) {
            ctx.fillStyle = '#FFD700'; 
        } else if (score >= 500) {
            ctx.fillStyle = '#8A2BE2'; 
        } else {
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--snake');
        }
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--food');
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI*2);
    ctx.fill();

    poisonList.forEach(p => {
        ctx.fillStyle = "black";
        ctx.fillRect(p.x * gridSize + 1, p.y * gridSize + 1, gridSize - 2, gridSize - 2);
        ctx.font = `${gridSize - 4}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("☠️", p.x * gridSize + gridSize / 2, p.y * gridSize + gridSize / 2 + 1);
    });
}

function update() {
    if (paused || isGameOver) return;

    const head = { 
        x: (snake[0].x + dx + tileCount) % tileCount, 
        y: (snake[0].y + dy + tileCount) % tileCount 
    };

    if (snake.some(p => p.x === head.x && p.y === head.y)) return gameOver("You bit your own tail!");
    if (poisonList.some(p => p.x === head.x && p.y === head.y)) return gameOver("You swallowed poison!");

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
        }
        updateScoreDisplay();
        generateFood();
        
        if (score % 50 === 0) {
            addPoison();
        }

        if (speed > 40) speed -= 0.8; 
        clearInterval(gameLoop);
        gameLoop = setInterval(update, speed);
    } else {
        snake.pop();
    }

    draw();
}

function gameOver(msg) {
    isGameOver = true;
    clearInterval(gameLoop);
    deathReasonEl.textContent = msg;
    finalStatsEl.innerHTML = `Your Score: ${score} <br> Highscore: ${highScore}`;
    overlay.classList.remove('hidden');
}

function changeDirection(newDx, newDy) {
    if (isGameOver) return;
    if (paused) {
        paused = false;
        gameLoop = setInterval(update, speed);
        statusEl.textContent = "Good Luck!";
    }
    if ((newDx === -dx && newDx !== 0) || (newDy === -dy && newDy !== 0)) return;
    dx = newDx; dy = newDy;
}

window.addEventListener('keydown', e => {
    switch (e.key.toLowerCase()) {
        case 'arrowup': case 'w': changeDirection(0, -1); break;
        case 'arrowdown': case 's': changeDirection(0, 1); break;
        case 'arrowleft': case 'a': changeDirection(-1, 0); break;
        case 'arrowright': case 'd': changeDirection(1, 0); break;
    }
});

document.getElementById('up-btn').onclick = () => changeDirection(0, -1);
document.getElementById('down-btn').onclick = () => changeDirection(0, 1);
document.getElementById('left-btn').onclick = () => changeDirection(-1, 0);
document.getElementById('right-btn').onclick = () => changeDirection(1, 0);
document.getElementById('reset-btn').onclick = () => { clearInterval(gameLoop); initGame(); };
document.getElementById('mode-switch').onclick = () => { document.body.classList.toggle('light-mode'); draw(); };

window.addEventListener('resize', initGame);
initGame();