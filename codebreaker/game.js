const COLORS = ["🟥","🟦","🟩","🟨","🟪","🟧","🟫"];
let secret = [];
let current = ["","","",""];

// ----------------------
//  Secret generieren
// ----------------------
function generateSecret() {
  secret = [];
  for (let i = 0; i < 4; i++) {
    secret.push(COLORS[Math.floor(Math.random()*COLORS.length)]);
  }
  console.log("Secret:", secret.join("")); // Debug
}
generateSecret();

// ----------------------
//  Palette generieren
// ----------------------
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

// ----------------------
//  Aktuelle Eingabezeile
// ----------------------
function setupRow() {
  const row = document.getElementById("currentRow");
  row.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.onclick = () => clearSlot(i);
    slot.id = "slot" + i;
    row.appendChild(slot);
  }
}
setupRow();

// ----------------------
//  Farbe setzen
// ----------------------
function selectColor(c) {
  for (let i = 0; i < 4; i++) {
    if (current[i] === "") {
      current[i] = c;
      document.getElementById("slot"+i).textContent = c;
      break;
    }
  }
}

// Slot leeren
function clearSlot(i) {
  current[i] = "";
  document.getElementById("slot"+i).textContent = "";
}

// ----------------------
//  Versuch auswerten
// ----------------------
function checkGuess() {
  if (current.includes("")) return;

  const fb = evaluate(current, secret);
  addHistoryRow(current, fb);

  if (fb === "🟩🟩🟩🟩") {
    setTimeout(() => {
      alert("Gewonnen!");
      resetGame();
    }, 50);
  } else {
    resetRow();
  }
}

function evaluate(guess, secret) {
  let result = "";
  for (let i = 0; i < 4; i++) {
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

// ----------------------
//  Historie
// ----------------------
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

// ----------------------
//  Reset
// ----------------------
function resetRow() {
  current = ["","","",""];
  setupRow();
}

function resetGame() {
  generateSecret();
  document.getElementById("history").innerHTML = "";
  resetRow();
}

// ----------------------
// Telegram WebApp
// ----------------------
if (window.Telegram && Telegram.WebApp) {
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
}
