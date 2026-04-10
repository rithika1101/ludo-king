import React from 'react';
import { PLAYER_COLORS } from '../constants/gameConstants';
import { capitalize } from '../logic/gameLogic';

function WinnerModal({ winner, onNewGame }) {
  const color = PLAYER_COLORS[winner];

  return (
    <div className="modal-overlay">
      <div className="winner-modal" style={{ '--wc': color }}>
        <div className="winner-confetti">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              background: ['#E53935','#43A047','#FDD835','#1E88E5','#fff','#FF9800'][i % 6],
            }} />
          ))}
        </div>

        <div className="winner-crown">👑</div>
        <div className="winner-title">WINNER!</div>
        <div className="winner-name" style={{ color }}>
          {capitalize(winner)}
        </div>
        <p className="winner-msg">Congratulations! All tokens reached home!</p>

        <button className="winner-btn" onClick={onNewGame}>
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default WinnerModal;
