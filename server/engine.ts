import { randomInt } from 'node:crypto';
import { BOARD_CELLS, CHANCE_CARDS, TRIAL_CARDS } from '../src/data/board';
import type { Cell, ChanceCard } from '../src/types/game';

export type OnlineAction = 'roll' | 'buy' | 'pass' | 'end-turn' | 'pay-bail';
export type OnlinePhase = 'rolling' | 'buying' | 'turn-end' | 'game-over';

export interface OnlinePlayer {
  id: string;
  name: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  jailCards: number;
  bankrupt: boolean;
}

export interface OnlineGame {
  players: OnlinePlayer[];
  currentPlayer: number;
  phase: OnlinePhase;
  round: number;
  maxRounds: number;
  dice: [number, number] | null;
  doubleCount: number;
  lastEvent: string;
  winnerId: string | null;
}

export class GameRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameRuleError';
  }
}

const START_MONEY = 15_000_000;
const START_BONUS = 2_000_000;
const BAIL = 500_000;
const TOKENS = ['🫖', '🎻', '🪆', '🐻', '🧢', '🚀'];

export function createOnlineGame(seats: { id: string; name: string }[], maxRounds = 30): OnlineGame {
  if (seats.length < 2 || seats.length > 6 || !Number.isInteger(maxRounds) || maxRounds < 1 || maxRounds > 100) {
    throw new GameRuleError('Требуется от 2 до 6 игроков и от 1 до 100 раундов');
  }
  return {
    players: seats.map((seat, index) => ({
      id: seat.id,
      name: seat.name,
      token: TOKENS[index],
      money: START_MONEY,
      position: 0,
      properties: [],
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      bankrupt: false,
    })),
    currentPlayer: 0,
    phase: 'rolling',
    round: 1,
    maxRounds,
    dice: null,
    doubleCount: 0,
    lastEvent: 'Партия началась',
    winnerId: null,
  };
}

function netWorth(game: OnlineGame, player: OnlinePlayer): number {
  return player.money + player.properties.reduce((sum, id) => sum + (BOARD_CELLS[id]?.price ?? 0), 0);
}

function checkWinner(game: OnlineGame): boolean {
  const active = game.players.filter((player) => !player.bankrupt);
  if (active.length > 1 && game.round <= game.maxRounds) return false;
  game.phase = 'game-over';
  game.winnerId = [...active].sort((a, b) => netWorth(game, b) - netWorth(game, a))[0]?.id ?? null;
  return true;
}

function advanceTurn(game: OnlineGame): void {
  if (checkWinner(game)) return;
  const current = game.players[game.currentPlayer];
  if (!current.bankrupt && game.doubleCount > 0 && !current.inJail) {
    game.phase = 'rolling';
    return;
  }
  let next = game.currentPlayer;
  do {
    next = (next + 1) % game.players.length;
    if (next <= game.currentPlayer) game.round++;
  } while (game.players[next].bankrupt && next !== game.currentPlayer);
  game.currentPlayer = next;
  game.doubleCount = 0;
  game.phase = 'rolling';
  checkWinner(game);
}

function bankrupt(game: OnlineGame, player: OnlinePlayer): void {
  player.money = 0;
  player.properties = [];
  player.bankrupt = true;
  player.inJail = false;
  game.lastEvent = player.name + ' объявлен банкротом';
  if (game.players[game.currentPlayer].id === player.id) {
    game.doubleCount = 0;
    advanceTurn(game);
  } else {
    checkWinner(game);
  }
}

function charge(game: OnlineGame, payer: OnlinePlayer, amount: number, creditor?: OnlinePlayer): void {
  const paid = Math.min(payer.money, amount);
  payer.money -= paid;
  if (creditor) creditor.money += paid;
  if (paid < amount) bankrupt(game, payer);
}

function rentFor(game: OnlineGame, cell: Cell, owner: OnlinePlayer, diceSum: number): number {
  if (cell.type === 'transport') {
    const count = owner.properties.filter((id) => BOARD_CELLS[id]?.type === 'transport').length;
    return 250_000 * 2 ** (count - 1);
  }
  if (cell.type === 'utility') {
    const count = owner.properties.filter((id) => BOARD_CELLS[id]?.type === 'utility').length;
    return diceSum * (count >= 2 ? 100_000 : 40_000);
  }
  const monopoly = BOARD_CELLS.filter((item) => item.type === 'city' && item.color === cell.color)
    .every((item) => owner.properties.includes(item.id));
  return (cell.rent?.[0] ?? 0) * (monopoly ? 2 : 1);
}

function movePlayer(game: OnlineGame, player: OnlinePlayer, steps: number): void {
  const total = player.position + steps;
  if (total >= BOARD_CELLS.length) player.money += START_BONUS;
  player.position = total % BOARD_CELLS.length;
}

function resolveCell(game: OnlineGame, player: OnlinePlayer, diceSum: number, random: (min: number, max: number) => number, allowCard = true): void {
  const cell = BOARD_CELLS[player.position];
  if (cell.type === 'go-to-jail') {
    player.position = 10;
    player.inJail = true;
    player.jailTurns = 0;
    game.doubleCount = 0;
    game.lastEvent = player.name + ' отправлен в тюрьму';
    return;
  }
  if (cell.type === 'tax') {
    const tax = cell.id === 4 ? 2_000_000 : 1_500_000;
    game.lastEvent = player.name + ' платит налог';
    charge(game, player, tax);
    return;
  }
  if (cell.type === 'city' || cell.type === 'transport' || cell.type === 'utility') {
    const owner = game.players.find((seat) => !seat.bankrupt && seat.properties.includes(cell.id));
    if (owner && owner.id !== player.id) {
      const rent = rentFor(game, cell, owner, diceSum);
      game.lastEvent = player.name + ' платит аренду ' + owner.name;
      charge(game, player, rent, owner);
    } else if (!owner && (cell.price ?? 0) <= player.money) {
      game.phase = 'buying';
      game.lastEvent = player.name + ' может купить ' + cell.nameKey;
    }
    return;
  }
  if (!allowCard || (cell.type !== 'chance' && cell.type !== 'trial')) return;
  const deck = cell.type === 'chance' ? CHANCE_CARDS : TRIAL_CARDS;
  const card = deck[random(0, deck.length)] as ChanceCard;
  game.lastEvent = card.textKey;
  const effect = card.effect;
  if (effect.money) {
    if (effect.money < 0) charge(game, player, -effect.money);
    else player.money += effect.money;
  }
  if (game.phase === 'game-over' || player.bankrupt) return;
  if (effect.taxPerProperty) {
    const cost = effect.taxPerProperty > 0
      ? effect.taxPerProperty * player.properties.length
      : Math.round(-effect.taxPerProperty * player.properties.reduce((sum, id) => sum + (BOARD_CELLS[id].price ?? 0), 0));
    charge(game, player, cost);
  }
  if (game.phase === 'game-over' || player.bankrupt) return;
  if (effect.collectFromPlayers) {
    for (const other of game.players) {
      if (other.id !== player.id && !other.bankrupt) charge(game, other, effect.collectFromPlayers, player);
    }
  }
  if (effect.getOutOfJail) player.jailCards++;
  if (effect.moveToCell !== undefined) {
    const previous = player.position;
    player.position = effect.moveToCell;
    if (player.position === 0 && previous !== 0) player.money += START_BONUS;
    if (player.position === 10) {
      player.inJail = true;
      player.jailTurns = 0;
      game.doubleCount = 0;
    } else {
      resolveCell(game, player, diceSum, random, false);
    }
  }
}

export function applyOnlineAction(
  state: OnlineGame,
  actorId: string,
  action: OnlineAction,
  random: (min: number, max: number) => number = randomInt,
): OnlineGame {
  if (state.phase === 'game-over') throw new GameRuleError('Партия завершена');
  const current = state.players[state.currentPlayer];
  if (!current || current.id !== actorId || current.bankrupt) throw new GameRuleError('Сейчас ход другого игрока');
  const game = structuredClone(state);
  const player = game.players[game.currentPlayer];

  if (action === 'pay-bail') {
    if (game.phase !== 'rolling' || !player.inJail || player.money < BAIL) throw new GameRuleError('Нельзя оплатить залог');
    player.money -= BAIL;
    player.inJail = false;
    player.jailTurns = 0;
    game.lastEvent = player.name + ' вышел из тюрьмы';
    return game;
  }

  if (action === 'roll') {
    if (game.phase !== 'rolling') throw new GameRuleError('Сейчас нельзя бросать кубики');
    const first = random(1, 7);
    const second = random(1, 7);
    if (![first, second].every((value) => Number.isInteger(value) && value >= 1 && value <= 6)) {
      throw new GameRuleError('Некорректный бросок кубиков');
    }
    const sum = first + second;
    const isDouble = first === second;
    game.dice = [first, second];
    game.phase = 'turn-end';
    game.lastEvent = player.name + ' выбросил ' + first + ' + ' + second;
    if (player.inJail) {
      if (!isDouble && player.jailTurns < 2) {
        player.jailTurns++;
        game.doubleCount = 0;
        advanceTurn(game);
        return game;
      }
      if (!isDouble) {
        if (player.money < BAIL) {
          bankrupt(game, player);
          return game;
        }
        player.money -= BAIL;
      }
      player.inJail = false;
      player.jailTurns = 0;
      game.doubleCount = 0;
    } else {
      game.doubleCount = isDouble ? game.doubleCount + 1 : 0;
      if (game.doubleCount >= 3) {
        player.position = 10;
        player.inJail = true;
        player.jailTurns = 0;
        game.doubleCount = 0;
        game.lastEvent = 'Три дубля: ' + player.name + ' отправлен в тюрьму';
        advanceTurn(game);
        return game;
      }
    }
    movePlayer(game, player, sum);
    resolveCell(game, player, sum, random);
    return game;
  }

  if (action === 'buy' || action === 'pass') {
    if (game.phase !== 'buying') throw new GameRuleError('Нет объекта для покупки');
    const cell = BOARD_CELLS[player.position];
    if (!cell.price || game.players.some((seat) => seat.properties.includes(cell.id))) {
      throw new GameRuleError('Объект недоступен');
    }
    if (action === 'buy') {
      if (player.money < cell.price) throw new GameRuleError('Недостаточно денег');
      player.money -= cell.price;
      player.properties.push(cell.id);
      game.lastEvent = player.name + ' купил ' + cell.nameKey;
    }
    game.phase = 'turn-end';
    return game;
  }

  if (action === 'end-turn') {
    if (game.phase !== 'turn-end') throw new GameRuleError('Сначала завершите текущее действие');
    advanceTurn(game);
    return game;
  }
  throw new GameRuleError('Неизвестное действие');
}
