import { describe, expect, it } from 'vitest';
import {
  addOnlinePlayer, applyOnlineAction, createOnlineRoom, ONLINE_START_MONEY,
  setOnlineConnected, type Dice, type OnlineRoomState,
} from './onlineEngine';

function readyRoom(): OnlineRoomState {
  let state = createOnlineRoom('R100', 'alice', 'Алиса', 1000);
  state = addOnlinePlayer(state, 'bob', 'Боб', 1001);
  state = applyOnlineAction(state, 'alice', { type: 'ready', ready: true }, 1002);
  state = applyOnlineAction(state, 'bob', { type: 'ready', ready: true }, 1003);
  return applyOnlineAction(state, 'alice', { type: 'start' }, 1004);
}

function roll(state: OnlineRoomState, id: string, dice: Dice) {
  return applyOnlineAction(state, id, { type: 'roll' }, 1005, () => dice);
}

describe('online server authoritative core', () => {
  it('starts only with 2+ ready players and host authorization', () => {
    const initial = createOnlineRoom('X', 'alice', 'Alice');
    expect(() => applyOnlineAction(initial, 'alice', { type: 'start' })).toThrow();
    let second = addOnlinePlayer(initial, 'bob', 'Bob');
    expect(() => applyOnlineAction(second, 'bob', { type: 'start' })).toThrow();
    expect(() => applyOnlineAction(second, 'alice', { type: 'start' })).toThrow();
    second = applyOnlineAction(second, 'alice', { type: 'ready', ready: true });
    second = applyOnlineAction(second, 'bob', { type: 'ready', ready: true });
    const started = applyOnlineAction(second, 'alice', { type: 'start' });
    expect(started.currentPlayerId).toBe('alice');
    expect(started.phase).toBe('rolling');
  });

  it('rejects action out of turn without mutating state', () => {
    const state = readyRoom();
    const snapshot = JSON.stringify(state);
    expect(() => roll(state, 'bob', [1, 2])).toThrow('не ваш ход');
    expect(JSON.stringify(state)).toBe(snapshot);
  });

  it('validates dice values supplied by server RNG', () => {
    const state = readyRoom();
    expect(() => roll(state, 'alice', [0, 7])).toThrow();
    expect(() => roll(state, 'alice', [1.2, 3])).toThrow();
  });

  it('uses the existing canonical catalog when buying and charging rent', () => {
    let state = readyRoom();
    state = roll(state, 'alice', [1, 2]); // cell 3, St Petersburg
    expect(state.phase).toBe('buy');
    const price = 600_000;
    state = applyOnlineAction(state, 'alice', { type: 'buy' });
    expect(state.players[0].properties).toContain(3);
    expect(state.players[0].money).toBe(ONLINE_START_MONEY - price);
    state = applyOnlineAction(state, 'alice', { type: 'end' });
    expect(state.currentPlayerId).toBe('bob');
    // Bob lands on cell 3 and pays owner.
    state = roll(state, 'bob', [1, 2]);
    expect(state.players[1].money).toBeLessThan(ONLINE_START_MONEY);
    expect(state.players[0].money).toBeGreaterThan(ONLINE_START_MONEY - price);
  });

  it('prevents double buying and spend beyond balance', () => {
    let state = readyRoom();
    state = roll(state, 'alice', [1, 2]);
    const bought = applyOnlineAction(state, 'alice', { type: 'buy' });
    expect(() => applyOnlineAction(bought, 'alice', { type: 'buy' })).toThrow();
    const poor = structuredClone(state);
    poor.players[0].money = 0;
    expect(() => applyOnlineAction(poor, 'alice', { type: 'buy' })).toThrow();
  });

  it('handles skip and advances turn', () => {
    let state = readyRoom();
    state = roll(state, 'alice', [1, 2]);
    state = applyOnlineAction(state, 'alice', { type: 'pass' });
    state = applyOnlineAction(state, 'alice', { type: 'end' });
    expect(state.currentPlayerId).toBe('bob');
    expect(state.round).toBe(1);
  });

  it('applies tax and basic jail mechanics', () => {
    let state = readyRoom();
    state = roll(state, 'alice', [2, 2]); // tax cell 4
    expect(state.players[0].money).toBe(ONLINE_START_MONEY - 2_000_000);
    // Three doubles -> jail.
    state = applyOnlineAction(state, 'alice', { type: 'end' });
    state = roll(state, 'alice', [1, 1]);
    if (state.phase === 'buy') state = applyOnlineAction(state, 'alice', { type: 'pass' });
    state = applyOnlineAction(state, 'alice', { type: 'end' });
    state = roll(state, 'alice', [1, 1]);
    expect(state.players[0].jailTurns).toBe(2);
    expect(state.players[0].position).toBe(10);
  });

  it('awards start bonus precisely once on crossing', () => {
    let state = readyRoom();
    state.players[0].position = 38;
    state = roll(state, 'alice', [1, 2]);
    expect(state.players[0].money).toBe(ONLINE_START_MONEY + 2_000_000 - 600_000 * 0);
    expect(state.players[0].position).toBe(1);
  });

  it('prevents overfilling room and restores connection status', () => {
    let state = createOnlineRoom('X', 'one', 'One');
    for (let i = 2; i <= 6; i++) state = addOnlinePlayer(state, String(i), 'Player' + i);
    expect(() => addOnlinePlayer(state, '7', 'Seven')).toThrow('заполнена');
    state = setOnlineConnected(state, 'one', false);
    expect(state.players[0].connected).toBe(false);
    state = setOnlineConnected(state, 'one', true);
    expect(state.players[0].connected).toBe(true);
  });
});
