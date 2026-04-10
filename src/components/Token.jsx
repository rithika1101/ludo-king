import React from 'react';
import { PLAYER_COLORS, PLAYER_DARK_COLORS, GRID_SIZE } from '../constants/gameConstants';

const CELL = 100 / GRID_SIZE; // percent per cell

const STACK_OFFSETS = [
  { x: 0,  y: 0  },
  { x: -2.5, y: -2.5 },
  { x: 2.5,  y: -2.5 },
  { x: 0,  y:  2.5 },
];

function Token({ token, pos, stackIndex, stackTotal, isValid, isSelected, onClick }) {
  if (!pos) return null;

  const { color, status } = token;
  const leftPct = pos.col * CELL + CELL / 2;
  const topPct  = pos.row * CELL + CELL / 2;
  const offset  = stackTotal > 1 ? (STACK_OFFSETS[stackIndex] ?? { x: 0, y: 0 }) : { x: 0, y: 0 };

  const classes = ['token'];
  if (isValid)              classes.push('token-valid');
  if (isSelected)           classes.push('token-selected');
  if (status === 'finished') classes.push('token-finished');

  return (
    <div
      className={classes.join(' ')}
      style={{
        left: `${leftPct}%`,
        top:  `${topPct}%`,
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
        '--token-color': PLAYER_COLORS[color],
        '--token-dark':  PLAYER_DARK_COLORS[color],
      }}
      onClick={isValid ? onClick : undefined}
      role={isValid ? 'button' : undefined}
      tabIndex={isValid ? 0 : undefined}
      onKeyDown={isValid ? (e) => e.key === 'Enter' && onClick() : undefined}
      title={`${color[0].toUpperCase() + color.slice(1)} token ${token.id + 1}`}
    >
      <div className="token-body">
        <div className="token-shine" />
        <div className="token-number">{token.id + 1}</div>
      </div>
      {isValid && <div className="token-pulse" />}
    </div>
  );
}

export default React.memo(Token);
