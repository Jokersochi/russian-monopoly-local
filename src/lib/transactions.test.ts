import { describe, expect, it } from 'vitest';
import type { GameState, Player, TradeOffer } from '../types/game';
import { canExecuteTrade, canPlaceBid, isValidGameState } from './transactions';

const player = (id: number, properties: number[]): Player => ({
  id, nameKey: `player${id}`, token: '', money: 100, position: 0, properties, mortgaged: [],
  getOutOfJailCards: 0, inJail: false, jailTurns: 0, hasResidence: false, contracts: [],
  bankrupt: false, stats: { rentCollected: 0, rentPaid: 0, propertiesBought: 0 },
});
const state = (): GameState => ({
  players: [player(0, [1, 3]), player(1, [6])], currentPlayer: 0, dice: [1, 1], phase: 'rolling',
  lastRoll: null, doubleCount: 0, gameLog: [], round: 1, maxRounds: 20, houses: {},
});
const offer = (): TradeOffer => ({ fromPlayer: 0, toPlayer: 1, offeredProperties: [1],
  requestedProperties: [6], offeredMoney: 10, requestedMoney: 20 });

describe('transaction boundaries', () => {
  it.each([NaN, Infinity, -1, 1.5, 101, Number.MAX_SAFE_INTEGER + 1])('rejects invalid bid %s', amount => {
    const game = state();
    game.phase = 'auction';
    game.auctionState = { cellId: 8, currentBid: 1, highBidder: null, currentBidder: 0,
      participants: [0, 1], passedPlayers: [] };
    expect(canPlaceBid(game, amount)).toBe(false);
    expect(canPlaceBid(game, 100)).toBe(true);
    game.auctionState.passedPlayers = [0];
    expect(canPlaceBid(game, 100)).toBe(false);
  });
  it.each([NaN, Infinity, -1, 1.5, 101])('rejects invalid money on either trade side %s', money => {
    expect(canExecuteTrade(state(), { ...offer(), offeredMoney: money })).toBe(false);
    expect(canExecuteTrade(state(), { ...offer(), requestedMoney: money })).toBe(false);
  });
  it('rejects forged ownership, duplicate assets, self trade and stale turn', () => {
    expect(canExecuteTrade(state(), offer())).toBe(true);
    for (const invalid of [{ offeredProperties: [6] }, { offeredProperties: [1, 1] },
      { toPlayer: 0 }, { toPlayer: 50 }, { fromPlayer: 1 }]) {
      expect(canExecuteTrade(state(), { ...offer(), ...invalid })).toBe(false);
    }
  });
  it('rejects encumbered properties, bankrupt players and overflow', () => {
    const game = state();
    game.players[0].mortgaged = [1];
    expect(canExecuteTrade(game, offer())).toBe(false);
    game.players[0].mortgaged = [];
    game.houses[1] = 1;
    expect(canExecuteTrade(game, offer())).toBe(false);
    game.houses = {};
    game.players[1].bankrupt = true;
    expect(canExecuteTrade(game, offer())).toBe(false);
    game.players[1].bankrupt = false;
    game.players[0].money = Number.MAX_SAFE_INTEGER;
    expect(canExecuteTrade(game, offer())).toBe(false);
  });
});

describe('isValidGameState', () => {
  it('accepts valid state object', () => {
    expect(isValidGameState(state())).toBe(true);
  });

  it('rejects null, non-objects, and missing required properties', () => {
    expect(isValidGameState(null)).toBe(false);
    expect(isValidGameState('invalid')).toBe(false);
    expect(isValidGameState({})).toBe(false);
    expect(isValidGameState({ players: [] })).toBe(false);
    expect(isValidGameState({ players: null })).toBe(false);
  });

  it('rejects invalid currentPlayer or malformed player objects', () => {
    const s = state();
    expect(isValidGameState({ ...s, currentPlayer: 99 })).toBe(false);
    expect(isValidGameState({ ...s, currentPlayer: -1 })).toBe(false);
    expect(isValidGameState({ ...s, phase: 123 })).toBe(false);
    const badPlayer = { ...s.players[0], money: 'not a number' };
    expect(isValidGameState({ ...s, players: [badPlayer] })).toBe(false);
  });
});
