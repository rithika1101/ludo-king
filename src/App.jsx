import React, { useState, useCallback, useEffect, useRef } from 'react';
import Board from './components/Board';
import Dice from './components/Dice';
import GameLog from './components/GameLog';
import PlayerPanel from './components/PlayerPanel';
import WinnerModal from './components/WinnerModal';
import {
  createInitialTokens,
  rollDice,
  getValidMoves,
  applyMove,
  capitalize,
  getFinishedCount,
} from './logic/gameLogic';
import { PLAYERS } from './constants/gameConstants';
import './styles/global.css';

const ALL_PLAYERS = [PLAYERS.RED, PLAYERS.GREEN, PLAYERS.YELLOW, PLAYERS.BLUE];

function App() {
  const [numPlayers, setNumPlayers]           = useState(4);
  const [gameStarted, setGameStarted]         = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [tokens, setTokens]                   = useState(() => createInitialTokens());
  const [playerOrder, setPlayerOrder]         = useState(ALL_PLAYERS);
  const [currentIndex, setCurrentIndex]       = useState(0);
  const [diceValue, setDiceValue]             = useState(null);
  const [isRolling, setIsRolling]             = useState(false);
  const [isAnimating, setIsAnimating]         = useState(false);
  const [validMoves, setValidMoves]           = useState([]);
  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [gameLog, setGameLog]                 = useState([]);
  const [winner, setWinner]                   = useState(null);
  const [turnMessage, setTurnMessage]         = useState('');
  const [diceRolled, setDiceRolled]           = useState(false);
  const [consecutiveSixes, setConsecutiveSixes] = useState(0);

  const logRef = useRef(null);

  const currentColor = playerOrder[currentIndex];

  // Auto-scroll log to newest entry
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [gameLog]);

  const addLog = useCallback((msg) => {
    setGameLog((prev) => [...prev, msg]);
  }, []);

  // ── Advance to next player's turn ─────────────────────────────
  const advanceTurn = useCallback(
    (currentTokens, order, currentIdx) => {
      const n = order.length;
      let nextIdx = (currentIdx + 1) % n;
      // Skip players whose all tokens are finished
      for (let i = 0; i < n; i++) {
        const c = order[nextIdx];
        if (!currentTokens[c].every((t) => t.status === 'finished')) break;
        nextIdx = (nextIdx + 1) % n;
      }
      setCurrentIndex(nextIdx);
      setDiceValue(null);
      setDiceRolled(false);
      setValidMoves([]);
      setSelectedTokenId(null);
      setConsecutiveSixes(0);
      const nextColor = order[nextIdx];
      setTurnMessage(`${capitalize(nextColor)}'s turn — Roll the dice!`);
    },
    []
  );

  // ── Start game ────────────────────────────────────────────────
  const startGame = useCallback(
    (n) => {
      const order = ALL_PLAYERS.slice(0, n);
      const freshTokens = createInitialTokens();
      setPlayerOrder(order);
      setTokens(freshTokens);
      setCurrentIndex(0);
      setDiceValue(null);
      setDiceRolled(false);
      setValidMoves([]);
      setSelectedTokenId(null);
      setGameLog([`Game started! ${capitalize(order[0])} goes first 🎲`]);
      setWinner(null);
      setTurnMessage(`${capitalize(order[0])}'s turn — Roll the dice!`);
      setConsecutiveSixes(0);
      setIsRolling(false);
      setIsAnimating(false);
      setGameStarted(true);
    },
    []
  );

  const handleNewGame = useCallback(() => {
    startGame(numPlayers);
  }, [numPlayers, startGame]);

  // ── Roll dice ─────────────────────────────────────────────────
  const handleRoll = useCallback(() => {
    if (isRolling || isAnimating || diceRolled || winner) return;

    setIsRolling(true);
    setSelectedTokenId(null);

    setTimeout(() => {
      const value = rollDice();
      setIsRolling(false);
      setDiceValue(value);
      setDiceRolled(true);

      // Three consecutive sixes → forfeit turn
      if (value === 6 && consecutiveSixes >= 2) {
        addLog(`${capitalize(currentColor)} rolled three 6s in a row — turn forfeited! 🚫`);
        setConsecutiveSixes(0);
        setTimeout(() => advanceTurn(tokens, playerOrder, currentIndex), 1400);
        return;
      }

      const newSixes = value === 6 ? consecutiveSixes + 1 : 0;
      setConsecutiveSixes(newSixes);

      addLog(`${capitalize(currentColor)} rolled a ${value} 🎲`);

      const moves = getValidMoves(tokens, currentColor, value);

      if (moves.length === 0) {
        setTurnMessage(`${capitalize(currentColor)} has no valid moves — turn passes`);
        addLog(`${capitalize(currentColor)} has no valid moves`);
        setTimeout(() => advanceTurn(tokens, playerOrder, currentIndex), 1400);
        return;
      }

      setValidMoves(moves);
      setTurnMessage(`${capitalize(currentColor)} rolled ${value} — pick a token to move`);
    }, 850);
  }, [
    isRolling, isAnimating, diceRolled, winner,
    currentColor, tokens, consecutiveSixes,
    addLog, advanceTurn, playerOrder, currentIndex,
  ]);

  // ── Token click ───────────────────────────────────────────────
  const handleTokenClick = useCallback(
    (color, tokenId) => {
      if (color !== currentColor) return;
      if (!diceRolled || isAnimating || winner) return;

      const move = validMoves.find((m) => m.tokenId === tokenId);
      if (!move) return;

      setSelectedTokenId(tokenId);
      setIsAnimating(true);

      // Short delay for animation feel
      setTimeout(() => {
        const result = applyMove(tokens, currentColor, move, diceValue);
        setTokens(result.tokens);
        addLog(result.logEntry);

        setIsAnimating(false);
        setSelectedTokenId(null);

        if (result.winner) {
          setWinner(result.winner);
          addLog(`🏆 ${capitalize(result.winner).toUpperCase()} WINS THE GAME! 🏆`);
          return;
        }

        if (result.extraTurn) {
          setDiceRolled(false);
          setValidMoves([]);
          setDiceValue(null);
          const reason =
            diceValue === 6 ? 'rolled a 6' :
            result.captured ? 'captured a token' :
            'reached home';
          setTurnMessage(`${capitalize(currentColor)} gets another turn! (${reason}) 🔄`);
          addLog(`${capitalize(currentColor)} gets an extra turn! (${reason})`);
        } else {
          advanceTurn(result.tokens, playerOrder, currentIndex);
        }
      }, 500);
    },
    [
      currentColor, diceRolled, isAnimating, winner,
      validMoves, tokens, diceValue,
      addLog, advanceTurn, playerOrder, currentIndex,
    ]
  );

  const finishedCounts = getFinishedCount(tokens);
  const validTokenIds  = new Set(validMoves.map((m) => m.tokenId));

  // ─── LEADERBOARD SCREEN ───────────────────────────────────────
  if (showLeaderboard) {
    const COLOR_META = {
      red:    { label: 'Red',    emoji: '🔴', bg: '#d32f2f' },
      green:  { label: 'Green',  emoji: '🟢', bg: '#2e7d32' },
      yellow: { label: 'Yellow', emoji: '🟡', bg: '#fdd835', dark: true },
      blue:   { label: 'Blue',   emoji: '🔵', bg: '#1565c0' },
    };
    const MEDAL = ['🥇', '🥈', '🥉', '4️⃣'];

    // Sort players: winner first, then by finished tokens desc, then by home progress
    const ranked = [...playerOrder].sort((a, b) => {
      if (winner === a) return -1;
      if (winner === b) return 1;
      return (finishedCounts[b] || 0) - (finishedCounts[a] || 0);
    });

    return (
      <div className="app">
        <header className="app-header">
          <div className="header-left">
            <div className="logo-mini">
              {['red','green','yellow','blue'].map((c) => (
                <div key={c} className={`logo-dot logo-dot-${c}`} />
              ))}
            </div>
            <span className="header-title">LUDO KING</span>
          </div>
          <div className="header-right">
            <button
              className="btn-icon"
              onClick={() => setShowLeaderboard(false)}
              title="Back to Game"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', width: 'auto', gap: '0.3rem', display:'flex', alignItems:'center' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
              Back
            </button>
          </div>
        </header>

        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          gap: '1.5rem',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>🏆</div>
            <h2 style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '2rem', fontWeight: 700, letterSpacing: '0.08em', color: '#f5c842' }}>
              LEADERBOARD
            </h2>
            <p style={{ color: '#7a9bbd', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {winner ? `${capitalize(winner).toUpperCase()} WINS!` : 'Current standings'}
            </p>
          </div>

          <div style={{
            width: '100%',
            maxWidth: '420px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {ranked.map((color, i) => {
              const meta = COLOR_META[color];
              const finished = finishedCounts[color] || 0;
              const progress = Math.round((finished / 4) * 100);
              const isWinner = color === winner;
              return (
                <div
                  key={color}
                  style={{
                    background: isWinner ? 'rgba(245,200,66,0.12)' : 'var(--surface)',
                    border: isWinner ? '1px solid rgba(245,200,66,0.45)' : '1px solid var(--border2)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    boxShadow: isWinner ? '0 0 20px rgba(245,200,66,0.15)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '1.6rem', minWidth: '2rem', textAlign: 'center' }}>{MEDAL[i]}</div>
                  <div style={{
                    width: '14px',
                    height: '44px',
                    borderRadius: '4px',
                    background: meta.bg,
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1rem', fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.04em' }}>
                        {meta.emoji} {meta.label}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#7a9bbd' }}>
                        {finished}/4 home
                      </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: meta.bg,
                        borderRadius: '999px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="start-btn"
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem' }}
              onClick={() => { setShowLeaderboard(false); handleNewGame(); }}
            >
              NEW GAME
            </button>
            <button
              className="start-btn"
              style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem', background: 'var(--surface2)' }}
              onClick={() => setShowLeaderboard(false)}
            >
              RESUME
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── START SCREEN ─────────────────────────────────────────────
  if (!gameStarted) {
    return (
      <div className="start-screen">
        <div className="start-card">
          <div className="start-logo">
            <div className="logo-board">
              {['red', 'green', 'yellow', 'blue'].map((c) => (
                <div key={c} className={`logo-corner logo-${c}`} />
              ))}
            </div>
          </div>
          <h1 className="start-title">LUDO KING</h1>
          <p className="start-subtitle">Classic Board Game</p>

          <div className="player-select">
            <p>Number of Players</p>
            <div className="player-btns">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  className={`player-btn ${numPlayers === n ? 'active' : ''}`}
                  onClick={() => setNumPlayers(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button className="start-btn" onClick={() => startGame(numPlayers)}>
            START GAME
          </button>
        </div>
      </div>
    );
  }

  // ─── GAME SCREEN ──────────────────────────────────────────────
  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo-mini">
            {['red','green','yellow','blue'].map((c) => (
              <div key={c} className={`logo-dot logo-dot-${c}`} />
            ))}
          </div>
          <span className="header-title">LUDO KING</span>
        </div>
        <div className="header-right">
          <button
            className="btn-icon"
            onClick={() => setShowLeaderboard(true)}
            title="Leaderboard"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', width: 'auto', gap: '0.3rem', display:'flex', alignItems:'center' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:'16px',height:'16px'}}>
              <path d="M18 20V10M12 20V4M6 20v-6"/>
            </svg>
            Ranks
          </button>
          <button className="btn-icon" onClick={handleNewGame} title="New Game">
            {/* Restart icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main layout */}
      <main className="game-layout">
        {/* Left sidebar */}
        <aside className="left-panel">
          <PlayerPanel
            players={playerOrder}
            currentColor={currentColor}
            finishedCounts={finishedCounts}
            turnMessage={turnMessage}
          />
          <Dice
            value={diceValue}
            isRolling={isRolling}
            onRoll={handleRoll}
            disabled={diceRolled || isAnimating || !!winner}
            currentColor={currentColor}
          />
        </aside>

        {/* Board */}
        <section className="board-section">
          <Board
            tokens={tokens}
            currentColor={currentColor}
            validTokenIds={validTokenIds}
            selectedTokenId={selectedTokenId}
            onTokenClick={handleTokenClick}
          />
        </section>

        {/* Right sidebar */}
        <aside className="right-panel">
          <GameLog entries={gameLog} logRef={logRef} />
        </aside>
      </main>

      {winner && <WinnerModal winner={winner} onNewGame={handleNewGame} />}
    </div>
  );
}

export default App;
