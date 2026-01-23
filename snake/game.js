const canvas = document.getElementById('snake-board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const statusEl = document.getElementById('status');

const gridSize = 20;
let tileCount;
let snake, food, dx, dy, score, gameLoop, speed;
let paused = true;

function initGame() {
    const size = Math.min(window.innerWidth - 30, 600);
    canvas.width = canvas.height = Math.floor(size / gridSize) * gridSize;
    tileCount = canvas.width / gridSize;

    snake = [{ x: Math.floor(tileCount/2), y: Math.floor(tileCount/2) }];
    generateFood();
    dx = 0; dy = 0;
    score = 0;
    speed = 100;
    paused = true;
    scoreEl.textContent = score;
    statusEl.textContent = "Arrow keys or WASD to start!";
    draw();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    if (snake.some(part => part.x === food.x && part.y === food.y)) generateFood();
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
        ctx.fillStyle = index === 0 ? '#4ae620' : getComputedStyle(document.body).getPropertyValue('--snake');
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });

    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--food');
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI*2);
    ctx.fill();
}

function update() {
    if (paused) return;

    const head = { 
        x: (snake[0].x + dx + tileCount) % tileCount, 
        y: (snake[0].y + dy + tileCount) % tileCount 
    };
    if (snake.some(part => part.x === head.x && part.y === head.y)) return gameOver();

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        generateFood();
        if (speed > 40) speed -= 0.5; 
        clearInterval(gameLoop);
        gameLoop = setInterval(update, speed);
    } else {
        snake.pop();
    }

    draw();
}

function gameOver() {
    clearInterval(gameLoop);
    statusEl.textContent = "Game Over! Score: " + score;
    paused = true;
}

function changeDirection(newDx, newDy) {
    if (paused) {
        paused = false;
        gameLoop = setInterval(update, speed);
        statusEl.textContent = "Viel Glück!";
    }
    if ((newDx === -dx && newDx !== 0) || (newDy === -dy && newDy !== 0)) return;
    dx = newDx;
    dy = newDy;
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