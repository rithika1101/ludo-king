import React from 'react';
import {
  WHITE_YARD, HOME_AREA_COLOR, TOKEN_SLOT_COLOR, HOME_STRAIGHT_COLOR,
  STAR_CELLS, ARROW_CELLS, TRACK_CELL_KEYS,
} from '../constants/gameConstants';

function Cell({ row, col }) {
  const key = `${row},${col}`;

  // Skip center 3×3 — rendered as SVG overlay in Board
  if (row >= 7 && row <= 9 && col >= 7 && col <= 9) return null;

  // Priority-ordered classification
  const slotColor     = TOKEN_SLOT_COLOR[key];
  const straightColor = HOME_STRAIGHT_COLOR[key];
  const homeAreaColor = HOME_AREA_COLOR[key];
  const inWhiteYard   = WHITE_YARD.has(key);
  const isStar        = STAR_CELLS.has(key);
  const arrowDir      = ARROW_CELLS[key];
  // Track cells INCLUDE the 4 corner bridge cells (6,6),(6,10),(10,10),(10,6)
  const isTrack       = TRACK_CELL_KEYS.has(key);

  let className = 'cell';
  let content   = null;

  if (slotColor) {
    // ── Colored token pad inside white yard ───────────────────
    className += ` cell-token-slot cell-slot-${slotColor}`;
    content = <div className="slot-inner" />;

  } else if (straightColor) {
    // ── Colored home-straight lane toward center ───────────────
    className += ` cell-straight cell-straight-${straightColor}`;

  } else if (isTrack || arrowDir) {
    // ── Main track cell ────────────────────────────────────────
    // Corner bridge cells (6,6),(6,10),(10,10),(10,6) sit inside quadrant territory.
    // They render as solid colored squares to complete the L-shaped path corners.
    const CORNER_COLORS = { '6,6': 'red', '6,10': 'green', '10,10': 'yellow', '10,6': 'blue' };
    const bridgeColor = CORNER_COLORS[key];

    if (bridgeColor) {
      className += ` cell-home cell-home-${bridgeColor}`;
    } else {
      className += ' cell-track';
      if (isStar)   className += ' cell-safe';
      if (arrowDir) className += ' cell-entry';

      if (arrowDir) {
        const arrows = { right: '▶', left: '◀', up: '▲', down: '▼' };
        content = (
          <span className={`cell-arrow cell-arrow-${arrowDir}`} aria-hidden="true">
            {arrows[arrowDir]}
          </span>
        );
      } else if (isStar) {
        content = <span className="safe-star" aria-hidden="true">★</span>;
      }
    }

  } else if (homeAreaColor && inWhiteYard) {
    // ── White yard interior cells (inside the 5×5 white box) ──
    className += ' cell-yard-white';

  } else if (homeAreaColor) {
    // ── Outer colored quadrant background ─────────────────────
    className += ` cell-home cell-home-${homeAreaColor}`;

  } else {
    // ── Dead zone (corners between cross arms, no cell type) ───
    className += ' cell-void';
  }

  return (
    <div className={className} style={{ gridRow: row + 1, gridColumn: col + 1 }}>
      {content}
    </div>
  );
}

export default React.memo(Cell);
