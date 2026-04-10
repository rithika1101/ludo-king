import React from 'react';
import { PLAYER_COLORS } from '../constants/gameConstants';
import { capitalize } from '../logic/gameLogic';

function PlayerPanel({ players, currentColor, finishedCounts, turnMessage }) {
  return (
    <div className="player-panel">
      <div className="panel-header">PLAYERS</div>
      <div className="player-list">
        {players.map((color) => {
          const isActive = color === currentColor;
          const finished = finishedCounts[color] || 0;
          return (
            <div
              key={color}
              className={`player-card ${isActive ? 'player-card-active' : ''}`}
              style={{ '--pc': PLAYER_COLORS[color] }}
            >
              <div className="pc-indicator" />
              <div className="pc-info">
                <div className="pc-name">{capitalize(color)}</div>
                <div className="pc-tokens">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div
                      key={i}
                      className={`pc-token-dot ${i < finished ? 'pc-token-done' : ''}`}
                    />
                  ))}
                </div>
              </div>
              {isActive && (
                <div className="pc-active-badge">▶</div>
              )}
              <div className="pc-score">{finished}/4</div>
            </div>
          );
        })}
      </div>

      <div className="turn-message">
        <div className="tm-icon">ℹ</div>
        <div className="tm-text">{turnMessage}</div>
      </div>
    </div>
  );
}

export default PlayerPanel;
