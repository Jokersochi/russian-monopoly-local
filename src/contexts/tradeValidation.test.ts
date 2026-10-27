import { describe, it, expect } from 'vitest';
import { isValidTradeMoney } from './GameContext';

describe('isValidTradeMoney', () => {
  it('should return true for valid non-negative numbers', () => {
    expect(isValidTradeMoney(0)).toBe(true);
    expect(isValidTradeMoney(100)).toBe(true);
  });

  it('should return false for negative numbers', () => {
    expect(isValidTradeMoney(-100)).toBe(false);
    expect(isValidTradeMoney(-1)).toBe(false);
  });

  it('should return false for NaN and Infinity', () => {
    expect(isValidTradeMoney(NaN)).toBe(false);
    expect(isValidTradeMoney(Infinity)).toBe(false);
    expect(isValidTradeMoney(-Infinity)).toBe(false);
  });
});
