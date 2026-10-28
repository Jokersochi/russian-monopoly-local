import { describe, expect, it } from 'vitest';
import { isValidTradeMoney } from './GameContext';

describe('isValidTradeMoney', () => {
  it('accepts valid non-negative finite numbers', () => {
    expect(isValidTradeMoney(0)).toBe(true);
    expect(isValidTradeMoney(100)).toBe(true);
    expect(isValidTradeMoney(1_000_000)).toBe(true);
  });

  it('rejects negative numbers', () => {
    expect(isValidTradeMoney(-1)).toBe(false);
    expect(isValidTradeMoney(-500)).toBe(false);
  });

  it('rejects non-finite numeric values', () => {
    expect(isValidTradeMoney(NaN)).toBe(false);
    expect(isValidTradeMoney(Infinity)).toBe(false);
    expect(isValidTradeMoney(-Infinity)).toBe(false);
  });

  it('rejects non-number inputs', () => {
    expect(isValidTradeMoney('100')).toBe(false);
    expect(isValidTradeMoney(null)).toBe(false);
    expect(isValidTradeMoney(undefined)).toBe(false);
    expect(isValidTradeMoney({})).toBe(false);
  });
});
