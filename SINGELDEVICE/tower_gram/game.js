const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');

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
let lives = 3;
let speed = 5;
let gameActive = false;
let isFalling = false;
let blocks = [];
const blockSize = 80;
let currentBlock = null;
let visualShift = 0;
const groundHeight = 40;

function updateLivesDisplay() {
    if (!livesElement) return;
    let hearts = "";
    for (let i = 0; i < lives; i++) {
        hearts += "❤️<br>";
    }
    livesElement.innerHTML = hearts;
}

function setupGame() {
    score = 0;
    lives = 3;
    speed = 5;
    gameActive = true;
    isFalling = false;
    if(scoreElement) scoreElement.innerText = score;
    updateLivesDisplay();
    blocks = [];
    visualShift = 0;
    spawnNewBlock();
}

function spawnNewBlock() {
    isFalling = false;
    let targetYValue = (blocks.length === 0) 
        ? canvas.height - groundHeight - blockSize 
        : blocks[blocks.length - 1].y - blockSize;

    currentBlock = {
        x: 0,
        y: 80,
        direction: 1,
        targetY: targetYValue,
        isFirst: blocks.length === 0
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
        if (visualShift < 0.1) visualShift = 0;
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
        blocks.push({ x: currentBlock.x, y: currentBlock.y });
        spawnNewBlock();
    } else {
        const lastBlock = blocks[blocks.length - 1];
        const diff = Math.abs(currentBlock.x - lastBlock.x);
        const maxDiff = blockSize * 0.6;

        if (diff < maxDiff) {
            blocks.push({ x: currentBlock.x, y: currentBlock.y });
            score++;
            if(scoreElement) scoreElement.innerText = score;
            speed += 0.2;
            if (blocks.length > 3) visualShift += blockSize;
            spawnNewBlock();
        } else {
            lives--;
            updateLivesDisplay();
            if (lives <= 0) {
                gameActive = false;
            } else {
                spawnNewBlock();
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#777777";
    let groundOffset = (blocks.length > 3) 
        ? blocks[0].y - (canvas.height - groundHeight - blockSize) 
        : 0;
    ctx.fillRect(0, canvas.height - groundHeight + groundOffset, canvas.width, groundHeight);

    blocks.forEach((block, index) => {
        const img = (index === 0) ? imgBase : imgHouse;
        ctx.drawImage(img, block.x, block.y, blockSize, blockSize);
    });

    if (gameActive && currentBlock) {
        const img = currentBlock.isFirst ? imgBase : imgHouse;
        ctx.drawImage(img, currentBlock.x, currentBlock.y, blockSize, blockSize);
    } else if (!gameActive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(lives <= 0 ? "GAME OVER" : "Klicken zum Starten", canvas.width / 2, canvas.height / 2);
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