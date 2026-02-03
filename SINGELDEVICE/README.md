[![Telegram](https://img.shields.io/badge/Telegram-Join-blue?logo=telegram&style=for-the-badge)](https://t.me/stk_games)

---

# Game 1: Code Breaker (Color Breaker)
## Always use the latest release! 

**Purpose:** Browser-based color code-breaking game, part of a multi-bot repository.

---

## Folder Structure

/color-codebreaker/<br>
│ <br>
├─ game.html # Main game interface <br>
├─ styles-game.css # Game styling <br>
├─ index.html # Landing page for this bot <br>
├─ styles-index.css # Landing page styling <br>
├─ impressum.html # Legal page <br>
├─ styles-impressum.css <br>
├─ game.js # Core game logic <br>
└─ bot.py # Optional backend logic <br>

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


---
---
# Game 2: Gomoku
## Always use the latest release! 

**Purpose:** Browser-based game, the playing field is "infinite" and the goal is to place five game pieces in a row faster than the computer. 

---

##Folder Structure

/color-codebreaker/<br>
│ <br>
├─ game.html # Main game interface <br>
├─ styles-game.css # Game styling <br>
├─ index.html # Landing page for this bot <br>
├─ styles-index.css # Landing page styling <br>
├─ impressum.html # Legal page <br>
├─ styles-impressum.css <br>
├─ game.js # Core game logic <br>
└─ bot.py # Optional backend logic <br>

---

## Core Logic (game.js)

### State Variables

- `board` → Map storing `{x,y} → player`  
- `moves` → history of all moves  
- `currentPlayer` → 1 for human, -1 for computer  
- `winningLine` → stores winning combination  
- `gameOver` → boolean flag for game end  
- `cellSize`, `zoom`, `offsetX/Y` → viewport and canvas rendering  

### Key Functions

- `resetGame()` → clears board and state  
- `setStone(x,y,player,record)` → place stone on board  
- `draw()` → renders board, grid, stones, highlights last move & winning line  
- `drawStone(cx,cy,player,cs)` → renders individual stone with gradients  
- `screenToCell(x,y)` → convert screen coords to board coords  
- `handlePlayerMove(x,y)` → player input handler  
- `aiMove()` → computes computer move using simple heuristics  
- `checkWinLine(x,y,player)` → detects 5-in-a-row  
- `evaluateCell(x,y,difficulty)` → scores moves for AI  
- `countLine(...)` → helper for AI evaluation  
- `scoreForLine(...)` → helper for AI evaluation  

### UI Features

- Drag/pan canvas (`pointerdown/move/up`)  
- Zoom in/out via mouse wheel  
- Highlight last move (yellow)  
- Highlight winning line (gold)  
- Light/Dark mode toggle  

### Gameplay Notes

- AI tries to win, block human, or play optimal moves within a 3-cell radius of existing stones.  
- Infinite board is simulated by dynamically rendering the visible portion.  
- Works fully in-browser; can be integrated into Telegram Game API using `bot.py`.  

### Integration with Telegram Bot

- `bot.py` can be used to send Game buttons using `send_game(chat_id, GAME_SHORT_NAME)`  
- Game must be hosted via HTTPS (e.g., Netlify)  
- Inline mode allows players to start game directly in chats:

---

## License – Viewing Only

MIT-Viewing-Only License
Permission is hereby granted to view and read the code in this repository for educational and informational purposes only.  
Commercial use, modification, distribution, or deployment of this code is strictly prohibited without explicit permission from the author.

