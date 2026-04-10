import React, { useMemo } from 'react';
import Cell from './Cell';
import Token from './Token';
import { GRID_SIZE, PLAYER_COLORS } from '../constants/gameConstants';
import { buildBoardMap, getTokenPosition } from '../logic/gameLogic';

const PLAYERS = ['red', 'green', 'yellow', 'blue'];

function Board({ tokens, currentColor, validTokenIds, selectedTokenId, onTokenClick }) {
  const boardMap = useMemo(() => buildBoardMap(tokens), [tokens]);

  // All 289 cell positions
  const cellCoords = useMemo(() => {
    const arr = [];
    for (let r = 0; r < GRID_SIZE; r++)
      for (let c = 0; c < GRID_SIZE; c++)
        arr.push({ row: r, col: c, key: `${r},${c}` });
    return arr;
  }, []);

  // Token render data
  const tokenElements = useMemo(() => {
    const elements = [];
    PLAYERS.forEach((color) => {
      tokens[color].forEach((token) => {
        const pos = getTokenPosition(token);
        const posKey = `${pos.row},${pos.col}`;
        const stacked = token.status === 'board' ? (boardMap[posKey] || []) : [];
        const si = stacked.findIndex(t => t.color === color && t.tokenId === token.id);
        const isValid    = color === currentColor && validTokenIds.has(token.id) && token.status !== 'finished';
        const isSelected = color === currentColor && token.id === selectedTokenId;
        elements.push({ token, pos, stackIndex: Math.max(0, si), stackTotal: stacked.length, isValid, isSelected });
      });
    });
    return elements;
  }, [tokens, boardMap, currentColor, validTokenIds, selectedTokenId]);

  return (
    <div className="board-wrapper">
      <div className="board">
        {/* 289 cells */}
        {cellCoords.map(({ row, col, key }) => (
          <Cell key={key} row={row} col={col} />
        ))}

        {/* Center 3×3 — four triangular wedges + star */}
        <div className="center-area">
          <svg viewBox="0 0 100 100" className="center-svg" xmlns="http://www.w3.org/2000/svg">
            {/* Green — top */}
            <polygon points="0,0 100,0 50,50" fill={PLAYER_COLORS.green} />
            {/* Yellow — right (swapped from Blue) */}
            <polygon points="100,0 100,100 50,50" fill={PLAYER_COLORS.yellow} />
            {/* Blue — bottom (swapped from Yellow) */}
            <polygon points="100,100 0,100 50,50" fill={PLAYER_COLORS.blue} />
            {/* Red — left */}
            <polygon points="0,100 0,0 50,50" fill={PLAYER_COLORS.red} />
            {/* Crisp dividers */}
            <line x1="0"   y1="0"   x2="50" y2="50" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8"/>
            <line x1="100" y1="0"   x2="50" y2="50" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8"/>
            <line x1="100" y1="100" x2="50" y2="50" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8"/>
            <line x1="0"   y1="100" x2="50" y2="50" stroke="rgba(0,0,0,0.35)" strokeWidth="0.8"/>
            {/* White circle */}
            <circle cx="50" cy="50" r="14" fill="white"/>
            {/* Gold star */}
            <polygon
              points="50,37 52.9,46.1 62.6,46.1 55,51.8 57.9,60.9 50,55.2 42.1,60.9 45,51.8 37.4,46.1 47.1,46.1"
              fill="#8609ec" stroke="#7f00e6" strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Tokens */}
        {tokenElements.map(({ token, pos, stackIndex, stackTotal, isValid, isSelected }) => (
          <Token
            key={`${token.color}-${token.id}`}
            token={token} pos={pos}
            stackIndex={stackIndex} stackTotal={stackTotal}
            isValid={isValid} isSelected={isSelected}
            onClick={() => onTokenClick(token.color, token.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(Board);
