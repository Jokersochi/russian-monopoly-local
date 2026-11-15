/**
 * Rectangular 40-space perimeter.
 * 14 × 8 is required: a 13 × 8 rectangle has only 38 perimeter cells.
 */
export const BOARD_COLS = 14;
export const BOARD_ROWS = 8;
export const CELL_SIZE = 92;
export const BOARD_PADDING = 24;
export const BOARD_WIDTH = BOARD_COLS * CELL_SIZE + BOARD_PADDING * 2;
export const BOARD_HEIGHT = BOARD_ROWS * CELL_SIZE + BOARD_PADDING * 2;

export interface BoardPosition {
  col: number;
  row: number;
}

export function getBoardPositions(): BoardPosition[] {
  const result: BoardPosition[] = [];

  for (let col = BOARD_COLS - 1; col >= 0; col -= 1) {
    result.push({ col, row: BOARD_ROWS - 1 });
  }
  for (let row = BOARD_ROWS - 2; row >= 0; row -= 1) {
    result.push({ col: 0, row });
  }
  for (let col = 1; col < BOARD_COLS; col += 1) {
    result.push({ col, row: 0 });
  }
  for (let row = 1; row < BOARD_ROWS - 1; row += 1) {
    result.push({ col: BOARD_COLS - 1, row });
  }

  return result;
}

export const BOARD_POSITIONS = getBoardPositions();

export function getTokenCoordinates(position: number, slot = 0) {
  const point = BOARD_POSITIONS[position] ?? BOARD_POSITIONS[0];
  const spread = [-18, 18, -18, 18, 0, 0];
  const vertical = [-18, -18, 18, 18, -25, 25];

  return {
    x: BOARD_PADDING + point.col * CELL_SIZE + CELL_SIZE / 2 +
      spread[slot % spread.length] - 16,
    y: BOARD_PADDING + point.row * CELL_SIZE + CELL_SIZE / 2 +
      vertical[slot % vertical.length] - 16,
  };
}

/** Show intermediate cells for a normal dice move, teleport for long jumps. */
export function tokenMovementPath(previous: number, next: number): number[] {
  const distance = (next - previous + 40) % 40;
  if (distance === 0) return [next];
  if (distance > 12) return [previous, next];

  return Array.from({ length: distance + 1 }, (_, offset) =>
    (previous + offset) % 40,
  );
}
