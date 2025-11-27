const COLORS = ["🟥","🟧","🟨","🟩","🟦","🟪","🟫"];

const FIELD_COUNT = 5;

let secret = [];
let current = Array(FIELD_COUNT).fill("");
let attempts = 0;


function generateSecret() {
  secret = [];
  for (let i = 0; i < FIELD_COUNT; i++) {
    secret.push(COLORS[Math.floor(Math.random()*COLORS.length)]);
  }
  console.log("Secret:", secret.join(""));
}
generateSecret();


function setupPalette() {
  const palette = document.getElementById("palette");
  COLORS.forEach(c => {
    const el = document.createElement("div");
    el.className = "color";
    el.textContent = c;
    el.onclick = () => selectColor(c);
    palette.appendChild(el);
  });
}
setupPalette();


function setupRow() {
  const row = document.getElementById("currentRow");
  row.innerHTML = "";
  for (let i = 0; i < FIELD_COUNT; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.onclick = () => clearSlot(i);
    slot.id = "slot" + i;
    row.appendChild(slot);
  }
}
setupRow();


function selectColor(c) {
  for (let i = 0; i < FIELD_COUNT; i++) {
    if (current[i] === "") {
      current[i] = c;
      document.getElementById("slot"+i).textContent = c;
      break;
    }
  }
}


function clearSlot(i) {
  current[i] = "";
  document.getElementById("slot"+i).textContent = "";
}


function checkGuess() {
  if (current.includes("")) return;

  attempts++;

  const fb = evaluate(current, secret);
  addHistoryRow(current, fb);

  if (fb === "🟩".repeat(FIELD_COUNT)) {
    setTimeout(() => {
      alert(`You won, and it took you ${attempts} tries!`);
      resetGame();
    }, 50);
  } else {
    resetRow();
  }
}


function evaluate(guess, secret) {
  let result = "";
  for (let i = 0; i < FIELD_COUNT; i++) {
    if (guess[i] === secret[i]) {
      result += "🟩";
    } else if (secret.includes(guess[i])) {
      result += "🟨";
    } else {
      result += "⬛";
    }
  }
  return result;
}


function addHistoryRow(guess, fb) {
  const history = document.getElementById("history");
  const r = document.createElement("div");
  r.className = "row";

  const gEl = document.createElement("div");
  gEl.className = "guess";
  gEl.textContent = guess.join("");

  const fEl = document.createElement("div");
  fEl.className = "feedback";
  fEl.textContent = fb;

  r.appendChild(gEl);
  r.appendChild(fEl);
  history.appendChild(r);
}


function resetRow() {
  current = Array(FIELD_COUNT).fill("");
  setupRow();
}

function resetGame() {
  attempts = 0;
  generateSecret();
  document.getElementById("history").innerHTML = "";
  resetRow();
}


if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}
