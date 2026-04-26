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

let towerWobble = 0;
let wobbleTime = 0;

let ropeLength = 0; 
const ropeAnchorX = () => canvas.width / 2;
const ropeAnchorY = () => -(ropeLength - (canvas.height / 4));

function updateLivesDisplay() {
    if (!livesElement) return;
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤️<br>";
    livesElement.innerHTML = hearts;
}

function setupGame() {
    score = 0;
    lives = 3;
    speed = 3; 
    towerWobble = 0;
    wobbleTime = 0;
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

    ropeLength = canvas.height * 0.8;
    const stopPoint = (canvas.width / 2) - (blockSize / 2);
    const calculatedMaxAngle = Math.asin(stopPoint / ropeLength) * 0.9;

    currentBlock = {
        angle: -calculatedMaxAngle,
        maxAngle: calculatedMaxAngle,
        velocity: 0,
        gravity: 0.0015,
        x: 0,
        y: 0,
        targetY: targetYValue,
        isFirst: blocks.length === 0
    };
}

function getWobbleX(index) {
    return Math.sin(wobbleTime) * towerWobble * index * 0.2;
}

function update() {
    if (!gameActive) return;

    wobbleTime += 0.05;

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
            let acceleration = -1 * currentBlock.gravity * Math.sin(currentBlock.angle);
            currentBlock.velocity += acceleration * (speed / 3);
            currentBlock.angle += currentBlock.velocity;

            if (currentBlock.angle > currentBlock.maxAngle) {
                currentBlock.angle = currentBlock.maxAngle;
                currentBlock.velocity = 0;
            } else if (currentBlock.angle < -currentBlock.maxAngle) {
                currentBlock.angle = -currentBlock.maxAngle;
                currentBlock.velocity = 0;
            }
            
            currentBlock.x = ropeAnchorX() + Math.sin(currentBlock.angle) * ropeLength - blockSize / 2;
            currentBlock.y = ropeAnchorY() + Math.cos(currentBlock.angle) * ropeLength; 
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
        const lastIndex = blocks.length - 1;
        const lastBlock = blocks[lastIndex];
        const lastBlockVisualX = lastBlock.x + getWobbleX(lastIndex);
        const diff = Math.abs(currentBlock.x - lastBlockVisualX);
        const maxDiff = blockSize * 0.7;

        if (diff < maxDiff) {
            const currentWobbleX = getWobbleX(blocks.length);
            blocks.push({ x: currentBlock.x - currentWobbleX, y: currentBlock.y });
            score++;
            if (scoreElement) scoreElement.innerText = score;
            towerWobble += (diff / blockSize) * 8;
            speed += 0.15;
            if (blocks.length > 3) visualShift += blockSize;
            spawnNewBlock();
        } else {
            lives--;
            updateLivesDisplay();
            canvas.classList.add('shake-animation');
            currentBlock = null;
            setTimeout(() => {
                canvas.classList.remove('shake-animation');
                if (lives <= 0) {
                    gameActive = false;
                } else {
                    spawnNewBlock();
                }
            }, 300);
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
        const wobbleX = getWobbleX(index);
        ctx.drawImage(img, block.x + wobbleX, block.y, blockSize, blockSize);
    });

    if (gameActive && currentBlock) {
        if (!isFalling) {
            ctx.beginPath();
            ctx.moveTo(ropeAnchorX(), ropeAnchorY()); 
            ctx.lineTo(currentBlock.x + blockSize / 2, currentBlock.y);
            ctx.strokeStyle = "#444";
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        const img = currentBlock.isFirst ? imgBase : imgHouse;
        ctx.drawImage(img, currentBlock.x, currentBlock.y, blockSize, blockSize);
    } else if (!gameActive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText(lives <= 0 ? "GAME OVER" : "Tap to start", canvas.width / 2, canvas.height / 2);
    }
}

function handleInput(e) {
    if (e && e.type === 'touchstart') e.preventDefault();
    if (!gameActive) {
        setupGame();
        return;
    }
    if (currentBlock && !isFalling) isFalling = true;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('mousedown', handleInput);
window.addEventListener('touchstart', handleInput, { passive: false });

gameLoop();