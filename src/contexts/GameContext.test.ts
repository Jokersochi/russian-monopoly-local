import { describe, expect, it } from 'vitest';
import { isValidTradeMoney } from './GameContext';

describe('isValidTradeMoney security helper', () => {
  it('accepts valid non-negative finite numbers', () => {
    expect(isValidTradeMoney(0)).toBe(true);
    expect(isValidTradeMoney(100)).toBe(true);
    expect(isValidTradeMoney(15_000_000)).toBe(true);
  });

  it('rejects negative numbers', () => {
    expect(isValidTradeMoney(-1)).toBe(false);
    expect(isValidTradeMoney(-1000)).toBe(false);
  });

  it('rejects non-finite number values like NaN and Infinity', () => {
    expect(isValidTradeMoney(NaN)).toBe(false);
    expect(isValidTradeMoney(Infinity)).toBe(false);
    expect(isValidTradeMoney(-Infinity)).toBe(false);
  });

  it('rejects non-number data types', () => {
    expect(isValidTradeMoney('100')).toBe(false);
    expect(isValidTradeMoney(null)).toBe(false);
    expect(isValidTradeMoney(undefined)).toBe(false);
    expect(isValidTradeMoney({})).toBe(false);
  });
});
