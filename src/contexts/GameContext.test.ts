import { describe, it, expect } from 'vitest';
import { isValidTradeMoney } from './GameContext';

describe('isValidTradeMoney', () => {
  it('accepts non-negative finite numbers', () => {
    expect(isValidTradeMoney(0)).toBe(true);
    expect(isValidTradeMoney(100)).toBe(true);
    expect(isValidTradeMoney(1500)).toBe(true);
  });

  it('rejects negative numbers', () => {
    expect(isValidTradeMoney(-1)).toBe(false);
    expect(isValidTradeMoney(-500)).toBe(false);
  });

  it('rejects non-finite values like NaN and Infinity', () => {
    expect(isValidTradeMoney(NaN)).toBe(false);
    expect(isValidTradeMoney(Infinity)).toBe(false);
    expect(isValidTradeMoney(-Infinity)).toBe(false);
  });

  it('rejects non-number inputs if passed at runtime', () => {
    // @ts-expect-error testing runtime safeguard with invalid type
    expect(isValidTradeMoney('100')).toBe(false);
    expect(isValidTradeMoney(null as unknown as number)).toBe(false);
    expect(isValidTradeMoney(undefined as unknown as number)).toBe(false);
  });
});
