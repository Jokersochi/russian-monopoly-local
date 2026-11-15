import { describe, expect, it } from 'vitest';
import {
  BOARD_COLS,
  BOARD_ROWS,
  BOARD_POSITIONS,
  getBoardPositions,
  tokenMovementPath,
} from './boardGeometry';

describe('40-cell wide board', () => {
  it('has exactly 40 unique perimeter cells', () => {
    const points = getBoardPositions();
    expect(points).toHaveLength(40);
    expect(new Set(points.map(p => p.col + ':' + p.row)).size).toBe(40);
    expect(points.every(p => (
      p.col >= 0 && p.col < BOARD_COLS &&
      p.row >= 0 && p.row < BOARD_ROWS &&
      (p.col === 0 || p.col === BOARD_COLS - 1 ||
       p.row === 0 || p.row === BOARD_ROWS - 1)
    ))).toBe(true);
  });

  it('forms a continuous closed ring, including Start', () => {
    BOARD_POSITIONS.forEach((current, index) => {
      const next = BOARD_POSITIONS[(index + 1) % BOARD_POSITIONS.length];
      const distance = Math.abs(current.col - next.col) +
        Math.abs(current.row - next.row);
      expect(distance).toBe(1);
    });
  });

  it('animates forward and across Start without skipping spaces', () => {
    expect(tokenMovementPath(37, 3)).toEqual([37, 38, 39, 0, 1, 2, 3]);
    expect(tokenMovementPath(6, 9)).toEqual([6, 7, 8, 9]);
  });

  it('teleports on distant scripted moves', () => {
    expect(tokenMovementPath(30, 10)).toEqual([30, 10]);
  });
});
