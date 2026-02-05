const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const imgHouse = new Image();
imgHouse.src = 'IMAGES/tower_gram-yellowhouse.jpg';
const imgBase = new Image();
imgBase.src = 'IMAGES/tower_gram-yellowhouse-base.jpg';

let score = 0;
let speed = 4;
let gameActive = false;
let blocks = [];
const blockHeight = 60; 
let currentBlock;
let imagesLoaded = 0;

function checkImages() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        setupGame();
        gameLoop();
    }
}

imgHouse.onload = checkImages;
imgBase.onload = checkImages;

function setupGame() {
    score = 0;
    speed = 4;
    gameActive = true;
    scoreElement.innerText = score;
    
    const initialWidth = 150;
    blocks = [{
        x: (canvas.width - initialWidth) / 2,
        y: canvas.height - blockHeight - 50,
        width: initialWidth,
        isBase: true
    }];
    
    spawnNewBlock();
}

function spawnNewBlock() {
    const lastBlock = blocks[blocks.length - 1];
    currentBlock = {
        x: 0,
        y: lastBlock.y - blockHeight,
        width: lastBlock.width,
        direction: 1
    };
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (!gameActive) return;

    currentBlock.x += speed * currentBlock.direction;

    if (currentBlock.x + currentBlock.width > canvas.width || currentBlock.x < 0) {
        currentBlock.direction *= -1;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blocks.forEach((block) => {
        const img = block.isBase ? imgBase : imgHouse;
        ctx.drawImage(img, block.x, block.y, block.width, blockHeight);
    });

    if (gameActive && currentBlock) {
        ctx.drawImage(imgHouse, currentBlock.x, currentBlock.y, currentBlock.width, blockHeight);
    }
}

function handleInput(e) {
    if (e.type === 'touchstart') e.preventDefault();
    
    if (!gameActive) {
        setupGame();
        return;
    }

    const lastBlock = blocks[blocks.length - 1];
    const diff = currentBlock.x - lastBlock.x;

    if (Math.abs(diff) >= lastBlock.width) {
        gameActive = false;
        return;
    }

    const newWidth = lastBlock.width - Math.abs(diff);
    const newX = diff > 0 ? currentBlock.x : lastBlock.x;

    blocks.push({
        x: newX,
        y: currentBlock.y,
        width: newWidth,
        isBase: false
    });

    score++;
    scoreElement.innerText = score;
    speed += 0.2;

    if (blocks.length > 5) {
        const offset = blockHeight;
        blocks.forEach(b => b.y += offset);
    }

    spawnNewBlock();
}

window.addEventListener('touchstart', handleInput, { passive: false });
window.addEventListener('mousedown', handleInput);