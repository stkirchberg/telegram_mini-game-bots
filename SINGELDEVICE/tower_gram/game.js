const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const imgHouse = new Image();
const imgBase = new Image();
imgHouse.src = 'IMAGES/tower_gram-yellowhouse.jpg';
imgBase.src = 'IMAGES/tower_gram-yellowhouse-base.jpg';

let score = 0;
let speed = 5;
let gameActive = false;
let isFalling = false;
let blocks = [];
const blockSize = 80; 
let currentBlock = null;

function setupGame() {
    score = 0;
    speed = 5;
    gameActive = true;
    isFalling = false;
    scoreElement.innerText = score;
    
    blocks = [{
        x: (canvas.width - blockSize) / 2,
        y: canvas.height - blockSize - 20,
        width: blockSize
    }];
    
    spawnNewBlock();
}

function spawnNewBlock() {
    isFalling = false;
    currentBlock = {
        x: 0,
        y: 50,
        width: blockSize,
        direction: 1,
        targetY: blocks[blocks.length - 1].y - blockSize
    };
}

function update() {
    if (!gameActive) return;

    if (!isFalling) {
        currentBlock.x += speed * currentBlock.direction;
        if (currentBlock.x + blockSize > canvas.width || currentBlock.x < 0) {
            currentBlock.direction *= -1;
        }
    } else {
        currentBlock.y += 15; 
        if (currentBlock.y >= currentBlock.targetY) {
            currentBlock.y = currentBlock.targetY;
            checkLanding();
        }
    }
}

function checkLanding() {
    const lastBlock = blocks[blocks.length - 1];
    const diff = Math.abs(currentBlock.x - lastBlock.x);
    const overlapLimit = blockSize * 0.7; 

    if (diff < overlapLimit) {
        blocks.push({
            x: currentBlock.x,
            y: currentBlock.y,
            width: blockSize
        });
        score++;
        scoreElement.innerText = score;
        speed += 0.2;
        
        if (blocks.length > 4) {
            const shift = blockSize;
            blocks.forEach(b => b.y += shift);
        }
        spawnNewBlock();
    } else {
        gameActive = false;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blocks.forEach((block, index) => {
        const img = (index === 0) ? imgBase : imgHouse;
        ctx.drawImage(img, block.x, block.y, blockSize, blockSize);
    });

    if (gameActive && currentBlock) {
        ctx.drawImage(imgHouse, currentBlock.x, currentBlock.y, blockSize, blockSize);
    }
}

function handleInput(e) {
    if (e && e.type === 'touchstart') e.preventDefault();
    if (!gameActive) {
        setupGame();
        return;
    }
    if (!isFalling) {
        isFalling = true;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', handleInput, { passive: false });

gameLoop();