# 🎲 Ludo King — Browser-Based Ludo Game

A complete, polished, fully playable Ludo game built with React + Vite. No backend, no external game engines, no third-party UI frameworks.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
```

### Production Build

```bash
npm run build
npm run preview   # preview the production build
```

---

## 🎮 How to Play

1. **Start Screen** — Choose 2, 3, or 4 players and press **START GAME**
2. **Rolling the Dice** — Click the dice to roll. Your turn only.
3. **Moving Tokens** — After rolling, valid tokens glow/pulse. Click one to move it.
4. **Rolling a 6** — Unlocks a home token to enter the board. Also grants an extra turn.
5. **Captures** — Land on an opponent's token to send it back to their home (except on safe ★ cells). Grants an extra turn.
6. **Winning** — Get all 4 tokens to the center home area first!

### Rules Summary
| Rule | Behavior |
|------|----------|
| Enter board | Roll a 6 |
| Extra turn | Roll a 6, make a capture, or reach home |
| Three 6s in a row | Turn is forfeited |
| No valid moves | Turn passes automatically after 1.4s |
| Safe cells (★) | Cannot be captured on these squares |
| Win condition | All 4 tokens finish (reach center) |

---

## 🗂️ Project Structure

```
src/
├── App.jsx                    # Root component, full game state
├── main.jsx                   # React entry point
│
├── constants/
│   └── gameConstants.js       # Board paths, colors, safe cells, home slots
│
├── logic/
│   └── gameLogic.js           # Pure game logic: rollDice, getValidMoves, applyMove, etc.
│
├── components/
│   ├── Board.jsx              # 15×15 board renderer with token overlay
│   ├── Cell.jsx               # Individual board cell (track/home/safe/arrow)
│   ├── Token.jsx              # Animated, clickable token piece
│   ├── Dice.jsx               # Animated dice with roll effect
│   ├── GameLog.jsx            # Scrollable move history panel
│   ├── PlayerPanel.jsx        # Player status + turn message
│   └── WinnerModal.jsx        # Win celebration overlay
│
└── styles/
    └── global.css             # All styles (dark theme, board colors, animations)
```

---

## 🔧 Resetting the Game

- Click the **↺ restart icon** in the top-right header to start a new game instantly.
- Or press **PLAY AGAIN** in the winner screen.

---

## 🧩 Extending the Game

| Feature | Where to add |
|---------|-------------|
| Sound effects | `App.jsx` → `handleRoll`, `handleTokenClick` |
| AI player | `gameLogic.js` → add `getAIMove(validMoves)` |
| Online multiplayer | Replace local state with WebSocket/Firebase |
| Token themes | `Token.jsx` + CSS variables |
| More players (5-6) | Extend `ALL_PLAYERS` in `App.jsx` + add paths in `gameConstants.js` |

---

## 🎨 Design System

| Element | Value |
|---------|-------|
| Background | `#0d1b2a` (deep navy) |
| Surface | `#172535` |
| Gold accent | `#f5c842` / `#ff9800` |
| Font (UI) | Nunito 400–900 |
| Font (labels) | Rajdhani 600–700 |
| Board track | White (#FFFFFF) |
| Safe cells | Warm ivory (#FFFDE7) + ★ |
| Token animation | CSS `transition` + `@keyframes` |

