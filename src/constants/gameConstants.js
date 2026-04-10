// ─── 17×17 GRID LUDO BOARD ────────────────────────────────────────
// Center = (8,8). Quadrants: TL rows 0-6 cols 0-6, TR rows 0-6 cols 10-16,
//                             BL rows 10-16 cols 0-6, BR rows 10-16 cols 10-16
// Cross: horizontal rows 7,8,9 × cols 0-16; vertical cols 7,8,9 × rows 0-16

export const PLAYERS = {
  RED: 'red', GREEN: 'green', YELLOW: 'yellow', BLUE: 'blue',
};

export const PLAYER_COLORS = {
  red:    '#d32f2f',
  green:  '#2e7d32',
  yellow: '#fdd835',
  blue:   '#1565c0',
};

export const PLAYER_DARK_COLORS = {
  red:    '#7f0000',
  green:  '#003300',
  yellow: '#b8a000',
  blue:   '#003c8f',
};

export const NUM_TOKENS = 4;
export const GRID_SIZE  = 17;

// ─── HOME SLOTS (token parking positions inside yard) ────────────
// Quadrant is 7×7 (rows/cols 0-6). White yard: rows 1-5, cols 1-5.
// Token slots centered with even spacing: rows 2,4 × cols 2,4 within each quadrant.
export const HOME_SLOTS = {
  red:    [{row:2,col:2},{row:2,col:4},{row:4,col:2},{row:4,col:4}],
  green:  [{row:2,col:12},{row:2,col:14},{row:4,col:12},{row:4,col:14}],
  yellow: [{row:12,col:12},{row:12,col:14},{row:14,col:12},{row:14,col:14}],
  blue:   [{row:12,col:2},{row:12,col:4},{row:14,col:2},{row:14,col:4}],
};

// ─── MAIN TRACK (64 cells, clockwise) ────────────────────────────
// Includes 4 corner-bridge cells in the quadrant corners (6,6),(6,10),(10,10),(10,6)
const MAIN_TRACK = [
  // Left arm top edge → right (row 7)
  {row:7,col:1},{row:7,col:2},{row:7,col:3},{row:7,col:4},{row:7,col:5},{row:7,col:6}, // 0-5
  // TL corner bridge (in TL quadrant)
 // 6
  // Top arm left side → up (col 7)
  {row:6,col:7},{row:5,col:7},{row:4,col:7},{row:3,col:7},{row:2,col:7},{row:1,col:7},{row:0,col:7}, // 7-13
  // Green entry
  {row:0,col:8}, // 14
  // Top arm right side → down (col 9)
  {row:0,col:9},{row:1,col:9},{row:2,col:9},{row:3,col:9},{row:4,col:9},{row:5,col:9},{row:6,col:9}, // 15-21
  // TR corner bridge (in TR quadrant) // 22
  // Right arm top edge → right (row 7)
  {row:7,col:10},{row:7,col:11},{row:7,col:12},{row:7,col:13},{row:7,col:14},{row:7,col:15},{row:7,col:16}, // 23-29
  // Yellow entry
  {row:8,col:16}, // 30
  // Right arm bottom edge → left (row 9)
  {row:9,col:16},{row:9,col:15},{row:9,col:14},{row:9,col:13},{row:9,col:12},{row:9,col:11},{row:9,col:10}, // 31-37
  // BR corner bridge (in BR quadrant)// 38
  // Bottom arm right side → down (col 9)
  {row:10,col:9},{row:11,col:9},{row:12,col:9},{row:13,col:9},{row:14,col:9},{row:15,col:9},{row:16,col:9}, // 39-45
  // Blue entry
  {row:16,col:8}, // 46
  // Bottom arm left side → up (col 7)
  {row:16,col:7},{row:15,col:7},{row:14,col:7},{row:13,col:7},{row:12,col:7},{row:11,col:7},{row:10,col:7}, // 47-53
  // BL corner bridge (in BL quadrant) // 54
  // Left arm bottom edge → left (row 9)
  {row:9,col:6},{row:9,col:5},{row:9,col:4},{row:9,col:3},{row:9,col:2},{row:9,col:1},{row:9,col:0}, // 55-61
  // Red entry
  {row:8,col:0}, // 62
  {row:7,col:0}, // 63
];

// ─── HOME STRAIGHTS (6 colored cells toward center) ──────────────
const HOME_STRAIGHTS = {
  red:    [{row:8,col:1},{row:8,col:2},{row:8,col:3},{row:8,col:4},{row:8,col:5},{row:8,col:6}],
  green:  [{row:1,col:8},{row:2,col:8},{row:3,col:8},{row:4,col:8},{row:5,col:8},{row:6,col:8}],
  yellow: [{row:8,col:15},{row:8,col:14},{row:8,col:13},{row:8,col:12},{row:8,col:11},{row:8,col:10}],
  blue:   [{row:15,col:8},{row:14,col:8},{row:13,col:8},{row:12,col:8},{row:11,col:8},{row:10,col:8}],
};

// Entry index on MAIN_TRACK for each color
const COLOR_ENTRY_INDEX = { red: 60, green: 15, yellow: 30, blue: 45 };

function buildColorPath(color) {
  const entryIdx = COLOR_ENTRY_INDEX[color];
  const n = MAIN_TRACK.length; // 64
  const path = [];
  for (let i = 0; i < n; i++) {
    const trackIdx = (entryIdx + i) % n;
    path.push({ ...MAIN_TRACK[trackIdx], pathIndex: i });
  }
  // 6-cell home straight
  HOME_STRAIGHTS[color].forEach((cell, i) => {
    path.push({ ...cell, pathIndex: n + i, isHomeStraight: true });
  });
  // Center finish
  path.push({ row: 8, col: 8, pathIndex: n + 6, isCenter: true });
  return path;
}

export const COLOR_PATHS = {
  red:    buildColorPath('red'),
  green:  buildColorPath('green'),
  yellow: buildColorPath('yellow'),
  blue:   buildColorPath('blue'),
};

// Total path length = 64 (track) + 6 (straight) + 1 (center) = 71
export const FINISH_INDEX = MAIN_TRACK.length + 6; // 70

// ─── SAFE CELLS ───────────────────────────────────────────────────
// Entry squares + classic star positions
export const SAFE_CELL_KEYS = new Set([
  '8,0', '0,8', '8,16', '16,8',   // entry squares
  '7,1','1,9','9,15','15,7',        // classic safe squares
  '7,14','9,2','2,7','14,9',
]);

export function isSafeCell(row, col) {
  return SAFE_CELL_KEYS.has(`${row},${col}`);
}

// ─── BOARD CELL CLASSIFICATION MAPS ──────────────────────────────

// Quadrant home area: solid colored background
export const HOME_AREA_COLOR = (() => {
  const map = {};
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++)   map[`${r},${c}`]   = 'red';
  for (let r = 0; r < 7; r++) for (let c = 10; c < 17; c++) map[`${r},${c}`]   = 'green';
  for (let r = 10; r < 17; r++) for (let c = 10; c < 17; c++) map[`${r},${c}`] = 'yellow';
  for (let r = 10; r < 17; r++) for (let c = 0; c < 7; c++) map[`${r},${c}`]   = 'blue';
  return map;
})();

// White yard box: 5×5 centered inside each 7×7 quadrant (rows/cols 1-5 of each quadrant)
export const WHITE_YARD = (() => {
  const s = new Set();
  for (let r = 1; r <= 5; r++) for (let c = 1; c <= 5; c++) s.add(`${r},${c}`);         // TL
  for (let r = 1; r <= 5; r++) for (let c = 11; c <= 15; c++) s.add(`${r},${c}`);       // TR
  for (let r = 11; r <= 15; r++) for (let c = 11; c <= 15; c++) s.add(`${r},${c}`);     // BR
  for (let r = 11; r <= 15; r++) for (let c = 1; c <= 5; c++) s.add(`${r},${c}`);       // BL
  return s;
})();

// Token slot squares (2×2 inside each white yard) — colored squares for tokens to sit on
export const TOKEN_SLOT_COLOR = (() => {
  const map = {};
  // TL (red): rows 2,4 × cols 2,4
  [[2,2],[2,4],[4,2],[4,4]].forEach(([r,c]) => { map[`${r},${c}`] = 'red'; });
  // TR (green): rows 2,4 × cols 12,14
  [[2,12],[2,14],[4,12],[4,14]].forEach(([r,c]) => { map[`${r},${c}`] = 'green'; });
  // BR (yellow): rows 12,14 × cols 12,14
  [[12,12],[12,14],[14,12],[14,14]].forEach(([r,c]) => { map[`${r},${c}`] = 'yellow'; });
  // BL (blue): rows 12,14 × cols 2,4
  [[12,2],[12,4],[14,2],[14,4]].forEach(([r,c]) => { map[`${r},${c}`] = 'blue'; });
  return map;
})();

// Home straight colored cells
export const HOME_STRAIGHT_COLOR = (() => {
  const map = {};
  Object.entries(HOME_STRAIGHTS).forEach(([color, cells]) => {
    cells.forEach(c => { map[`${c.row},${c.col}`] = color; });
  });
  return map;
})();

// Star / safe visual markers (subset of SAFE_CELL_KEYS on main track)
export const STAR_CELLS = new Set([
  '7,1','1,9','9,15','15,7',
  '7,14','9,2','2,7','14,9',
]);

// Arrow entry cells
export const ARROW_CELLS = {
  '8,0':  'right',
  '0,8':  'down',
  '8,16': 'left',
  '16,8': 'up',
};

// All main track cell keys for quick lookup
export const TRACK_CELL_KEYS = new Set(MAIN_TRACK.map(c => `${c.row},${c.col}`));
