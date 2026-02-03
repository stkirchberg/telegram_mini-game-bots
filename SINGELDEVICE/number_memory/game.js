let sequence = [];
let input = [];
let length = 3;
let acceptingInput = false;

const display = document.getElementById("display");
const startBtn = document.getElementById("startBtn");
const keys = document.querySelectorAll(".key[data-num]");
const deleteKey = document.getElementById("deleteKey");
const enterKey = document.getElementById("enterKey");

function randomDigit() {
    return Math.floor(Math.random() * 10);
}

function startGame() {
    sequence = [];
    input = [];
    length = 3;

    for (let i = 0; i < length; i++) {
        sequence.push(randomDigit());
    }

    showSequence();
}

function showSequence() {
    acceptingInput = false;
    display.classList.remove("small");
    display.textContent = sequence.join(" ");

    setTimeout(() => {
        display.textContent = "";
        display.classList.add("small");
        display.textContent = "Your turn";
        acceptingInput = true;
    }, 2000);
}

function submitInput() {
    if (!acceptingInput) return;

    const correct = input.join("") === sequence.join("");

    if (!correct) {
        display.textContent = `Game Over · ${sequence.length - 1}`;
        display.classList.add("small");
        acceptingInput = false;
        return;
    }

    input = [];
    sequence.push(randomDigit());
    setTimeout(showSequence, 800);
}

keys.forEach(key => {
    key.addEventListener("click", () => {
        if (!acceptingInput) return;
        input.push(parseInt(key.dataset.num));
        display.textContent = input.join("");
    });
});

deleteKey.addEventListener("click", () => {
    if (!acceptingInput) return;
    input.pop();
    display.textContent = input.join("");
});

enterKey.addEventListener("click", submitInput);
startBtn.addEventListener("click", startGame);





// Theme toggle logic

const toggleBtn = document.getElementById("themeToggle");
const body = document.body;

if (localStorage.getItem("theme") === "light") {
    body.classList.add("light");
}

toggleBtn.addEventListener("click", () => {
    body.classList.toggle("light");
    localStorage.setItem(
        "theme",
        body.classList.contains("light") ? "light" : "dark"
    );
});