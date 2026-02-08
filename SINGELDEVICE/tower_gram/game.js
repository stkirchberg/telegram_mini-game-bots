const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

const imgHouse = new Image();
const imgBase = new Image();
imgHouse.src = '../IMAGES/tower_gram-yellowhouse.png';
imgBase.src = '../IMAGES/tower_gram-yellowhouse-base.png';

let score = 0;
let speed = 5;
let gameActive = false;
let isFalling = false;
let blocks = [];
const blockSize = 80;
let currentBlock = null;
let visualShift = 0;
const groundHeight = 40;

function setupGame() {
    score = 0;
    speed = 5;
    gameActive = true;
    isFalling = false;
    scoreElement.innerText = score;
    blocks = [];
    visualShift = 0;
    
    currentBlock = {
        x: canvas.width / 2 - blockSize / 2,
        y: 80,
        direction: 1,
        targetY: canvas.height - groundHeight - blockSize,
        isFirst: true
    };
}

function spawnNewBlock() {
    isFalling = false;
    currentBlock = {
        x: 0,
        y: 80,
        direction: 1,
        targetY: blocks[blocks.length - 1].y - blockSize,
        isFirst: false
    };
}

function update() {
    if (!gameActive) return;

    if (visualShift > 0) {
        let step = visualShift * 0.1;
        if (step < 0.5) step = 0.5;
        blocks.forEach(b => b.y += step);
        if (currentBlock) currentBlock.targetY += step;
        visualShift -= step;
        if (visualShift < 0) visualShift = 0;
    }

    if (currentBlock) {
        if (!isFalling) {
            currentBlock.x += speed * currentBlock.direction;
            if (currentBlock.x + blockSize > canvas.width || currentBlock.x < 0) {
                currentBlock.direction *= -1;
            }
        } else {
            currentBlock.y += 18;
            if (currentBlock.y >= currentBlock.targetY) {
                currentBlock.y = currentBlock.targetY;
                checkLanding();
            }
        }
    }
}

function checkLanding() {
    if (currentBlock.isFirst) {
        blocks.push({
            x: currentBlock.x,
            y: currentBlock.y
        });
        spawnNewBlock();
    } else {
        const lastBlock = blocks[blocks.length - 1];
        const diff = Math.abs(currentBlock.x - lastBlock.x);
        const maxDiff = blockSize * 0.6;

        if (diff < maxDiff) {
            blocks.push({
                x: currentBlock.x,
                y: currentBlock.y
            });
            score++;
            scoreElement.innerText = score;
            speed += 0.2;
            
            if (blocks.length > 3) {
                visualShift += blockSize;
            }
            spawnNewBlock();
        } else {
            gameActive = false;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#777777";
    let currentGroundY = canvas.height - groundHeight + (blocks.length > 3 ? (blocks[0].y - (canvas.height - groundHeight - blockSize)) : 0);
    ctx.fillRect(0, currentGroundY, canvas.width, groundHeight);

    blocks.forEach((block, index) => {
        const img = (index === 0) ? imgBase : imgHouse;
        ctx.drawImage(img, block.x, block.y, blockSize, blockSize);
    });

    if (gameActive && currentBlock) {
        const img = currentBlock.isFirst ? imgBase : imgHouse;
        ctx.drawImage(img, currentBlock.x, currentBlock.y, blockSize, blockSize);
    } else if (!gameActive && blocks.length === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Click to start", canvas.width / 2, canvas.height / 2);
    }
}

function handleInput(e) {
    if (e && e.type === 'touchstart') e.preventDefault();
    if (!gameActive) {
        setupGame();
        return;
    }
    if (currentBlock && !isFalling) {
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