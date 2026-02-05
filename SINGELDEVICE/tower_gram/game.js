const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let speed = 2;
let gameActive = true;
let blocks = [];
const blockHeight = 40;
let currentBlock;

const baseWidth = 200;
blocks.push({
    x: (canvas.width - baseWidth) / 2,
    y: canvas.height - blockHeight - 100,
    width: baseWidth
});

function initNewBlock() {
    const lastBlock = blocks[blocks.length - 1];
    currentBlock = {
        x: 0,
        y: lastBlock.y - blockHeight,
        width: lastBlock.width,
        direction: 1 
    };
}

function update() {
    if (!gameActive) return;

    currentBlock.x += speed * currentBlock.direction;

    if (currentBlock.x + currentBlock.width > canvas.width || currentBlock.x < 0) {
        currentBlock.direction *= -1;
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blocks.forEach((block, index) => {
        ctx.fillStyle = `hsl(${index * 15}, 70%, 50%)`;
        ctx.fillRect(block.x, block.y, block.width, blockHeight);
    });

    ctx.fillStyle = "#ecf0f1";
    ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.width, blockHeight);
}

window.addEventListener('mousedown', () => {
    if (!gameActive) {
        location.reload();
        return;
    }

    const lastBlock = blocks[blocks.length - 1];
    const diff = currentBlock.x - lastBlock.x;

    if (Math.abs(diff) >= lastBlock.width) {
        gameActive = false;
        alert("Game Over! Score: " + score);
        return;
    }

    const newWidth = lastBlock.width - Math.abs(diff);
    const newX = diff > 0 ? currentBlock.x : lastBlock.x;

    blocks.push({
        x: newX,
        y: currentBlock.y,
        width: newWidth
    });

    score++;
    scoreElement.innerText = "Score: " + score;
    speed += 0.2;

    if (blocks.length > 5) {
        blocks.forEach(b => b.y += blockHeight);
    }

    initNewBlock();
});

initNewBlock();
update();