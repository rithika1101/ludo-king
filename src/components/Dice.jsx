import React, { useState, useEffect } from 'react';
import { PLAYER_COLORS } from '../constants/gameConstants';

const DOTS = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

function DiceFace({ value, size = 80 }) {
  const dots = DOTS[value] || [];
  const dotR = size * 0.1;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="dice-face-svg">
      <rect
        x="4" y="4" width="92" height="92" rx="18" ry="18"
        fill="white"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="2"
        filter="url(#shadow)"
      />
      <defs>
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        <radialGradient id="dotGrad" cx="35%" cy="35%">
          <stop offset="0%" stopColor="#555" />
          <stop offset="100%" stopColor="#111" />
        </radialGradient>
      </defs>
      {/* Top highlight */}
      <rect x="8" y="8" width="84" height="20" rx="12" fill="rgba(255,255,255,0.6)" />
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="8" fill="url(#dotGrad)" />
      ))}
    </svg>
  );
}

function Dice({ value, isRolling, onRoll, disabled, currentColor }) {
  const [displayValue, setDisplayValue] = useState(1);
  const [rollClass, setRollClass] = useState('');

  useEffect(() => {
    if (isRolling) {
      setRollClass('dice-rolling');
      const interval = setInterval(() => {
        setDisplayValue(Math.floor(Math.random() * 6) + 1);
      }, 80);
      return () => clearInterval(interval);
    } else {
      setRollClass('');
      if (value !== null) setDisplayValue(value);
    }
  }, [isRolling, value]);

  const color = PLAYER_COLORS[currentColor];
  const isDisabled = disabled || isRolling;

  return (
    <div className="dice-container">
      <div className="dice-label">
        <span className="dice-label-dot" style={{ background: color }} />
        {currentColor?.toUpperCase()}'S DICE
      </div>

      <button
        className={`dice-btn ${rollClass} ${isDisabled ? 'dice-disabled' : ''}`}
        onClick={onRoll}
        disabled={isDisabled}
        style={{ '--player-color': color }}
        aria-label="Roll dice"
      >
        <div className={`dice-inner ${isRolling ? 'dice-spin' : ''}`}>
          <DiceFace value={displayValue} />
        </div>

        {!isDisabled && !value && (
          <div className="dice-cta">ROLL</div>
        )}
      </button>

      {value && !isRolling && (
        <div className="dice-result" style={{ color }}>
          {value === 6 ? '🎉 SIX!' : `Rolled ${value}`}
        </div>
      )}
    </div>
  );
}

export default Dice;
