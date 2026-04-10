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
