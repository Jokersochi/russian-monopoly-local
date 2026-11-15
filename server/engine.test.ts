import { describe, expect, it } from 'vitest';
import { applyOnlineAction, createOnlineGame, GameRuleError } from './engine';

const seats = [
  { id: 'alice', name: 'Алиса' },
  { id: 'bob', name: 'Борис' },
];

function roll(game: ReturnType<typeof createOnlineGame>, playerId: string, first: number, second: number) {
  let calls = 0;
  return applyOnlineAction(game, playerId, 'roll', (min) => {
    calls++;
    if (calls === 1) return first;
    if (calls === 2) return second;
    return min;
  });
}

describe('server-authoritative engine', () => {
  it('starts a game with stable player IDs and validates lobby size', () => {
    const game = createOnlineGame(seats);
    expect(game.players.map((player) => player.id)).toEqual(['alice', 'bob']);
    expect(game.phase).toBe('rolling');
    expect(() => createOnlineGame([seats[0]])).toThrow(GameRuleError);
  });

  it('does not let another player act or a player repeat a roll', () => {
    const game = createOnlineGame(seats);
    expect(() => roll(game, 'bob', 1, 2)).toThrow('Сейчас ход другого игрока');
    const next = roll(game, 'alice', 1, 2);
    expect(next.phase).toBe('buying');
    expect(game.players[0].position).toBe(0);
    expect(() => roll(next, 'alice', 1, 2)).toThrow('Сейчас нельзя бросать кубики');
  });

  it('buys a property and transfers rent on the next player turn', () => {
    let game = roll(createOnlineGame(seats), 'alice', 1, 2);
    game = applyOnlineAction(game, 'alice', 'buy');
    expect(game.players[0].properties).toEqual([3]);
    expect(game.players[0].money).toBe(14_400_000);
    game = applyOnlineAction(game, 'alice', 'end-turn');
    expect(game.currentPlayer).toBe(1);
    game = roll(game, 'bob', 1, 2);
    expect(game.players[1].money).toBe(14_980_000);
    expect(game.players[0].money).toBe(14_420_000);
    expect(game.phase).toBe('turn-end');
  });

  it('gives an extra turn on doubles and sends the player to jail after three doubles', () => {
    let game = roll(createOnlineGame(seats), 'alice', 1, 1);
    game = applyOnlineAction(game, 'alice', 'end-turn');
    expect(game.currentPlayer).toBe(0);
    game = roll(game, 'alice', 2, 2);
    expect(game.phase).toBe('buying');
    game = applyOnlineAction(game, 'alice', 'pass');
    game = applyOnlineAction(game, 'alice', 'end-turn');
    expect(game.currentPlayer).toBe(0);
    game = roll(game, 'alice', 3, 3);
    expect(game.players[0].inJail).toBe(true);
    expect(game.players[0].position).toBe(10);
    expect(game.currentPlayer).toBe(1);
  });

  it('validates actions and never trusts a client-provided dice result', () => {
    const game = createOnlineGame(seats);
    expect(() => applyOnlineAction(game, 'alice', 'buy')).toThrow(GameRuleError);
    expect(() => applyOnlineAction(game, 'alice', 'roll', () => 99)).toThrow('Некорректный бросок');
  });

  it('ends a one-round game after both players complete their turn', () => {
    let game = createOnlineGame(seats, 1);
    game = roll(game, 'alice', 1, 2);
    game = applyOnlineAction(game, 'alice', 'pass');
    game = applyOnlineAction(game, 'alice', 'end-turn');
    game = roll(game, 'bob', 1, 2);
    game = applyOnlineAction(game, 'bob', 'pass');
    game = applyOnlineAction(game, 'bob', 'end-turn');
    expect(game.phase).toBe('game-over');
    expect(game.winnerId).not.toBeNull();
  });
});
