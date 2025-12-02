# Game 1: Code Breaker (Color Breaker)
## Use the latest release! 

**Purpose:** Browser-based color code-breaking game, part of a multi-bot repository.

---

## Folder Structure

/color-codebreaker/
│
├─ game.html # Main game interface
├─ styles-game.css # Game styling
├─ index.html # Landing page for this bot
├─ styles-index.css # Landing page styling
├─ impressum.html # Legal page
├─ styles-impressum.css
├─ game.js # Core game logic
└─ bot.py # Optional backend logic

---

## Core Logic (game.js)

- `COLORS` → ["🟥","🟧","🟨","🟩","🟦","🟪","🟫"]  
- `FIELD_COUNT` → 5  
- `secret` → randomly generated color sequence  
- `current` → current player row  
- `attempts` → number of guesses  
- `gameActive` → boolean  

**Key Functions:**

```text
generateSecret()   → create random sequence
setupPalette()     → render clickable palette
setupRow()         → create empty row
selectColor(c)     → add color to first empty slot
clearSlot(i)       → remove color from slot
checkGuess()       → evaluate current row
evaluate(guess,secret) → returns feedback 🟩🟨⬛
addHistoryRow()    → append guess + feedback to history
resetRow()         → clear current row
resetGame()        → restart game
showWinOverlay()   → display winning message
```

---

## Notes

- Fully playable in browser.
- Designed for quick integration into multi-bot repository.
- Easy to extend: colors, field count, feedback system.

---

## License – Viewing Only

MIT-Viewing-Only License
Permission is hereby granted to view and read the code in this repository for educational and informational purposes only.  
Commercial use, modification, distribution, or deployment of this code is strictly prohibited without explicit permission from the author.
