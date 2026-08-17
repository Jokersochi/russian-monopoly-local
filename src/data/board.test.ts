import { describe, expect, it } from 'vitest';
import { BOARD_CELLS, CHANCE_CARDS, PLAYER_TOKENS, TRIAL_CARDS } from './board';

describe('board data integrity', () => {
  it('contains exactly 40 uniquely indexed perimeter cells', () => {
    expect(BOARD_CELLS).toHaveLength(40);
    expect(BOARD_CELLS.map(cell => cell.id)).toEqual(Array.from({ length: 40 }, (_, index) => index));

    const coordinates = BOARD_CELLS.map(cell => `${cell.position.x}:${cell.position.y}`);
    expect(new Set(coordinates).size).toBe(40);

    for (const cell of BOARD_CELLS) {
      expect(cell.position.x).toBeGreaterThanOrEqual(0);
      expect(cell.position.x).toBeLessThanOrEqual(10);
      expect(cell.position.y).toBeGreaterThanOrEqual(0);
      expect(cell.position.y).toBeLessThanOrEqual(10);
      expect(
        cell.position.x === 0 ||
          cell.position.x === 10 ||
          cell.position.y === 0 ||
          cell.position.y === 10,
      ).toBe(true);
    }
  });

  it('keeps priced assets economically valid', () => {
    const pricedCells = BOARD_CELLS.filter(cell => cell.price !== undefined);
    expect(pricedCells.length).toBeGreaterThan(0);

    for (const cell of pricedCells) {
      expect(cell.price).toBeGreaterThan(0);

      if (cell.rent) {
        expect(cell.rent.length).toBeGreaterThan(0);
        expect(cell.rent.every(value => value >= 0)).toBe(true);
      }

      if (cell.houseCost !== undefined) {
        expect(cell.houseCost).toBeGreaterThan(0);
      }
    }
  });

  it('has the required four corner cells in canonical positions', () => {
    expect(BOARD_CELLS[0]).toMatchObject({ type: 'start', position: { x: 10, y: 10 } });
    expect(BOARD_CELLS[10]).toMatchObject({ type: 'jail', position: { x: 0, y: 10 } });
    expect(BOARD_CELLS[20]).toMatchObject({ type: 'free-parking', position: { x: 0, y: 0 } });
    expect(BOARD_CELLS[30]).toMatchObject({ type: 'go-to-jail', position: { x: 10, y: 0 } });
  });
});

describe('card and token data integrity', () => {
  it.each([
    ['chance', CHANCE_CARDS],
    ['trial', TRIAL_CARDS],
  ])('keeps %s card ids unique and effects non-empty', (_name, cards) => {
    expect(cards.length).toBeGreaterThan(0);
    expect(new Set(cards.map(card => card.id)).size).toBe(cards.length);

    for (const card of cards) {
      expect(card.textKey.length).toBeGreaterThan(0);
      expect(Object.keys(card.effect).length).toBeGreaterThan(0);
    }
  });

  it('provides enough unique player tokens for the six-player mode', () => {
    expect(PLAYER_TOKENS.length).toBeGreaterThanOrEqual(6);
    expect(new Set(PLAYER_TOKENS.map(token => token.id)).size).toBe(PLAYER_TOKENS.length);
    expect(new Set(PLAYER_TOKENS.map(token => token.icon)).size).toBe(PLAYER_TOKENS.length);
  });
});
