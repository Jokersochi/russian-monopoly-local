import { describe, it, expect } from 'vitest';
import { isValidTradeMoney } from './GameContext';

describe('isValidTradeMoney input validation function', () => {
  it('accepts valid non-negative finite amounts', () => {
    expect(isValidTradeMoney(0, 100)).toBe(true);
    expect(isValidTradeMoney(500, 0)).toBe(true);
    expect(isValidTradeMoney(1000, 2000)).toBe(true);
  });

  it('rejects negative money amounts', () => {
    expect(isValidTradeMoney(-100, 500)).toBe(false);
    expect(isValidTradeMoney(500, -50)).toBe(false);
    expect(isValidTradeMoney(-1, -1)).toBe(false);
  });

  it('rejects non-finite values like NaN or Infinity', () => {
    expect(isValidTradeMoney(NaN, 100)).toBe(false);
    expect(isValidTradeMoney(100, Infinity)).toBe(false);
    expect(isValidTradeMoney(-Infinity, 100)).toBe(false);
  });
});
