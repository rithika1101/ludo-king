import {
  PLAYERS, COLOR_PATHS, HOME_SLOTS, NUM_TOKENS, isSafeCell, FINISH_INDEX,
} from '../constants/gameConstants';

// ─── TOKEN STATE ──────────────────────────────────────────────────
// status: 'home' | 'board' | 'finished'
// pathIndex: -1 if home, 0..(FINISH_INDEX-1) on board, FINISH_INDEX = finished

export function createInitialTokens() {
  const tokens = {};
  Object.values(PLAYERS).forEach((color) => {
    tokens[color] = Array.from({ length: NUM_TOKENS }, (_, i) => ({
      id: i, color, status: 'home', pathIndex: -1, homeSlot: i,
    }));
  });
  return tokens;
}

export function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

export function getTokenPosition(token) {
  if (token.status === 'home')     return HOME_SLOTS[token.color][token.homeSlot];
  if (token.status === 'finished') return { row: 8, col: 8 };
  const path = COLOR_PATHS[token.color];
  return path[token.pathIndex] || { row: 8, col: 8 };
}

export function getValidMoves(tokens, currentColor, diceValue) {
  const playerTokens = tokens[currentColor];
  const validMoves = [];

  playerTokens.forEach((token) => {
    if (token.status === 'finished') return;

    if (token.status === 'home') {
      if (diceValue === 6) validMoves.push({ tokenId: token.id, type: 'enter' });
      return;
    }

    const newPathIndex = token.pathIndex + diceValue;
    if (newPathIndex > FINISH_INDEX) return; // overshoot — not allowed

    if (newPathIndex === FINISH_INDEX) {
      validMoves.push({ tokenId: token.id, type: 'finish', newPathIndex });
      return;
    }

    validMoves.push({ tokenId: token.id, type: 'move', newPathIndex });
  });

  return validMoves;
}

export function applyMove(tokens, currentColor, move, diceValue) {
  const newTokens = JSON.parse(JSON.stringify(tokens));
  const token = newTokens[currentColor].find(t => t.id === move.tokenId);
  let logEntry = '';
  let extraTurn = diceValue === 6;
  let captured = false;

  if (move.type === 'enter') {
    token.status = 'board';
    token.pathIndex = 0;
    logEntry = `${capitalize(currentColor)} token ${move.tokenId + 1} entered the board`;

  } else if (move.type === 'finish') {
    token.status = 'finished';
    token.pathIndex = FINISH_INDEX;
    logEntry = `${capitalize(currentColor)} token ${move.tokenId + 1} reached HOME! 🏠`;
    extraTurn = true;

  } else {
    token.pathIndex = move.newPathIndex;
    logEntry = `${capitalize(currentColor)} token ${move.tokenId + 1} moved ${diceValue} step${diceValue !== 1 ? 's' : ''}`;

    // Capture check
    const newPos = COLOR_PATHS[currentColor][move.newPathIndex];
    if (newPos && !newPos.isHomeStraight && !newPos.isCenter && !isSafeCell(newPos.row, newPos.col)) {
      Object.values(PLAYERS).forEach((otherColor) => {
        if (otherColor === currentColor) return;
        newTokens[otherColor].forEach((otherToken) => {
          if (otherToken.status !== 'board') return;
          const otherPos = COLOR_PATHS[otherColor][otherToken.pathIndex];
          if (otherPos && otherPos.row === newPos.row && otherPos.col === newPos.col) {
            otherToken.status = 'home';
            otherToken.pathIndex = -1;
            captured = true;
            logEntry += ` — 💥 captured ${capitalize(otherColor)} token ${otherToken.id + 1}!`;
            extraTurn = true;
          }
        });
      });
    }
  }

  const winner = checkWin(newTokens, currentColor);
  return { tokens: newTokens, logEntry, extraTurn, captured, winner };
}

export function checkWin(tokens, color) {
  return tokens[color].every(t => t.status === 'finished') ? color : null;
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildBoardMap(tokens) {
  const map = {};
  Object.values(PLAYERS).forEach((color) => {
    tokens[color].forEach((token) => {
      if (token.status !== 'board') return;
      const pos = getTokenPosition(token);
      const key = `${pos.row},${pos.col}`;
      if (!map[key]) map[key] = [];
      map[key].push({ color, tokenId: token.id });
    });
  });
  return map;
}

export function getFinishedCount(tokens) {
  const counts = {};
  Object.values(PLAYERS).forEach((color) => {
    counts[color] = tokens[color].filter(t => t.status === 'finished').length;
  });
  return counts;
}
