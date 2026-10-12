import { describe, expect, it, beforeEach } from 'vitest';
import { getSlotInfo } from './GameContext';

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
}

describe('getSlotInfo defensive validation', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: createLocalStorageMock(),
      writable: true,
      configurable: true,
    });
  });

  it('returns null if localStorage key does not exist', () => {
    expect(getSlotInfo(1)).toBeNull();
  });

  it('returns null if localStorage contains invalid JSON', () => {
    localStorage.setItem('russianMonopolyState_1', '{ invalid json ');
    expect(getSlotInfo(1)).toBeNull();
  });

  it('returns null if localStorage JSON is not an object or lacks players array', () => {
    localStorage.setItem('russianMonopolyState_1', JSON.stringify('just a string'));
    expect(getSlotInfo(1)).toBeNull();

    localStorage.setItem('russianMonopolyState_1', JSON.stringify(12345));
    expect(getSlotInfo(1)).toBeNull();

    localStorage.setItem('russianMonopolyState_1', JSON.stringify({ round: 5 }));
    expect(getSlotInfo(1)).toBeNull();

    localStorage.setItem('russianMonopolyState_1', JSON.stringify({ players: 'not-an-array' }));
    expect(getSlotInfo(1)).toBeNull();
  });

  it('returns SaveSlotInfo when localStorage contains a valid GameState structure', () => {
    const validState = {
      players: [
        { nameKey: 'p1', displayName: 'Player 1' },
        { nameKey: 'p2' },
      ],
      round: 3,
      maxRounds: 50,
    };
    localStorage.setItem('russianMonopolyState_1', JSON.stringify(validState));

    const info = getSlotInfo(1);
    expect(info).not.toBeNull();
    expect(info?.slot).toBe(1);
    expect(info?.playerNames).toEqual(['Player 1', 'p2']);
    expect(info?.round).toBe(3);
    expect(info?.maxRounds).toBe(50);
  });
});
