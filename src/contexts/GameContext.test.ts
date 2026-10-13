import { describe, it, expect, vi } from 'vitest';
import { BOARD_CELLS } from '@/data/board';

describe('Monetary Input Validation Logic', () => {
  it('validates trade offer money amounts correctly', () => {
    function validateTradeMoney(offeredMoney: number, requestedMoney: number): boolean {
      return (
        Number.isFinite(offeredMoney) &&
        offeredMoney >= 0 &&
        Number.isFinite(requestedMoney) &&
        requestedMoney >= 0
      );
    }

    expect(validateTradeMoney(100, 200)).toBe(true);
    expect(validateTradeMoney(0, 0)).toBe(true);

    expect(validateTradeMoney(-100, 200)).toBe(false);
    expect(validateTradeMoney(100, -200)).toBe(false);
    expect(validateTradeMoney(NaN, 200)).toBe(false);
    expect(validateTradeMoney(100, Infinity)).toBe(false);
  });

  it('validates auction bid amounts correctly', () => {
    function validateBidAmount(amount: number): boolean {
      return Number.isFinite(amount) && amount > 0;
    }

    expect(validateBidAmount(1000)).toBe(true);

    expect(validateBidAmount(0)).toBe(false);
    expect(validateBidAmount(-500)).toBe(false);
    expect(validateBidAmount(NaN)).toBe(false);
    expect(validateBidAmount(Infinity)).toBe(false);
  });
});
