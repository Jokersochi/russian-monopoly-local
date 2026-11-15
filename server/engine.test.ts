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
  it('charges taxes and declares bankruptcy when the balance is insufficient', () => {
    const game = createOnlineGame(seats);
    const taxed = roll(game, 'alice', 2, 2);
    expect(taxed.players[0].money).toBe(13_000_000);
    const insolvent = createOnlineGame(seats);
    insolvent.players[0].money = 100;
    const finished = roll(insolvent, 'alice', 2, 2);
    expect(finished.players[0].bankrupt).toBe(true);
    expect(finished.phase).toBe('game-over');
    expect(finished.winnerId).toBe('bob');
  });

  it('awards the start bonus and resolves a chance bonus on the server', () => {
    const game = createOnlineGame(seats);
    game.players[0].position = 39;
    expect(roll(game, 'alice', 1, 2).players[0].money).toBe(17_000_000);
    game.players[0].position = 4;
    const chance = roll(game, 'alice', 1, 2);
    expect(chance.players[0].money).toBe(15_500_000);
  });

  it('supports bail and a forced release after three failed jail attempts', () => {
    const game = createOnlineGame(seats);
    game.players[0].position = 10;
    game.players[0].inJail = true;
    const released = applyOnlineAction(game, 'alice', 'pay-bail');
    expect(released.players[0].inJail).toBe(false);
    expect(released.players[0].money).toBe(14_500_000);
    game.players[0].jailTurns = 2;
    const forced = roll(game, 'alice', 1, 2);
    expect(forced.players[0].inJail).toBe(false);
    expect(forced.players[0].position).toBe(13);
    expect(forced.players[0].money).toBe(14_500_000);
  });

  it('calculates transport and utility rent using the owner portfolio', () => {
    const transport = createOnlineGame(seats);
    transport.players[0].properties = [5, 15];
    transport.currentPlayer = 1;
    transport.players[1].position = 2;
    const transportPaid = roll(transport, 'bob', 1, 2);
    expect(transportPaid.players[0].money).toBe(15_500_000);
    expect(transportPaid.players[1].money).toBe(14_500_000);

    const utility = createOnlineGame(seats);
    utility.players[0].properties = [12];
    utility.currentPlayer = 1;
    utility.players[1].position = 9;
    const utilityPaid = roll(utility, 'bob', 1, 2);
    expect(utilityPaid.players[0].money).toBe(15_120_000);
    expect(utilityPaid.players[1].money).toBe(14_880_000);
  });

  it('applies card movement into jail and protects game state from mutation', () => {
    const game = createOnlineGame(seats);
    game.players[0].position = 14;
    let calls = 0;
    const next = applyOnlineAction(game, 'alice', 'roll', (min) => {
      calls++;
      return calls === 1 ? 1 : calls === 2 ? 2 : 9;
    });
    expect(next.players[0].position).toBe(10);
    expect(next.players[0].inJail).toBe(true);
    expect(game.players[0].position).toBe(14);
  });

});
