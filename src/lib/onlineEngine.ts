import { BOARD_CELLS, CHANCE_CARDS, TRIAL_CARDS } from '../data/board';
import type { Cell, CardEffect } from '../types/game';

export const ONLINE_START_MONEY = 15_000_000;
export const ONLINE_GO_BONUS = 2_000_000;
export const ONLINE_BAIL = 500_000;
export const ONLINE_MAX_PLAYERS = 6;
export const ONLINE_BOARD_VERSION = 'classic-40-v1';

export type OnlinePhase = 'lobby' | 'rolling' | 'buy' | 'end' | 'finished';
export type OnlineAction =
  | { type: 'ready'; ready: boolean }
  | { type: 'start' }
  | { type: 'roll' }
  | { type: 'buy' }
  | { type: 'pass' }
  | { type: 'end' }
  | { type: 'bail' };
export type Dice = [number, number];

export interface OnlinePlayer {
  id: string;
  name: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  ready: boolean;
  connected: boolean;
  jailTurns: number;
  bankrupt: boolean;
  getOutOfJailCards: number;
}

export interface OnlineLog {
  id: number;
  text: string;
  at: number;
}

export interface OnlineRoomState {
  roomId: string;
  boardVersion: string;
  version: number;
  hostId: string;
  phase: OnlinePhase;
  currentPlayerId: string | null;
  players: OnlinePlayer[];
  round: number;
  dice: Dice | null;
  pendingProperty: number | null;
  extraRoll: boolean;
  doubleCount: number;
  winnerId: string | null;
  log: OnlineLog[];
  createdAt: number;
  updatedAt: number;
}

const SPECIAL_TAX: Record<number, number> = { 4: 2_000_000, 38: 1_500_000 };

export class OnlineRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OnlineRuleError';
  }
}

function ensure(condition: unknown, message: string): asserts condition {
  if (!condition) throw new OnlineRuleError(message);
}

function member(room: OnlineRoomState, id: string): OnlinePlayer {
  const found = room.players.find((player) => player.id === id);
  ensure(found && !found.bankrupt, 'Игрок не найден в комнате');
  return found;
}

function log(room: OnlineRoomState, text: string, now: number) {
  const nextId = (room.log[room.log.length - 1]?.id ?? 0) + 1;
  room.log.push({ id: nextId, text, at: now });
  if (room.log.length > 150) room.log.shift();
}

export function createOnlineRoom(roomId: string, playerId: string, name: string, now = Date.now()): OnlineRoomState {
  return {
    roomId,
    boardVersion: ONLINE_BOARD_VERSION,
    version: 1,
    hostId: playerId,
    phase: 'lobby',
    currentPlayerId: null,
    players: [{
      id: playerId, name, token: '👑', money: ONLINE_START_MONEY,
      position: 0, properties: [], ready: false, connected: true,
      jailTurns: 0, bankrupt: false, getOutOfJailCards: 0,
    }],
    round: 1, dice: null, pendingProperty: null, extraRoll: false,
    doubleCount: 0, winnerId: null, log: [{ id: 1, text: 'Комната создана', at: now }],
    createdAt: now, updatedAt: now,
  };
}

/** Pure, immutable reducer: any invalid action leaves the original state unchanged. */
export function addOnlinePlayer(room: OnlineRoomState, id: string, name: string, now = Date.now()): OnlineRoomState {
  ensure(room.phase === 'lobby', 'Партия уже началась');
  ensure(room.players.length < ONLINE_MAX_PLAYERS, 'Комната заполнена');
  ensure(!room.players.some((player) => player.id === id), 'Игрок уже в комнате');
  const next = structuredClone(room);
  const tokens = ['👑', '🚗', '💎', '🚀', '🎩', '🐻'];
  next.players.push({
    id, name, token: tokens[next.players.length], money: ONLINE_START_MONEY,
    position: 0, properties: [], ready: false, connected: true, jailTurns: 0,
    bankrupt: false, getOutOfJailCards: 0,
  });
  log(next, name + ' присоединился', now);
  next.version++;
  next.updatedAt = now;
  return next;
}

export function setOnlineConnected(room: OnlineRoomState, id: string, connected: boolean, now = Date.now()): OnlineRoomState {
  const next = structuredClone(room);
  member(next, id).connected = connected;
  next.version++;
  next.updatedAt = now;
  return next;
}

function nextTurn(room: OnlineRoomState, now: number): void {
  const active = room.players.filter((p) => !p.bankrupt);
  if (active.length <= 1) {
    room.phase = 'finished';
    room.winnerId = active[0]?.id ?? null;
    log(room, 'Партия завершена', now);
    return;
  }
  const currentIndex = room.players.findIndex((p) => p.id === room.currentPlayerId);
  for (let offset = 1; offset <= room.players.length; offset++) {
    const index = (currentIndex + offset) % room.players.length;
    if (!room.players[index].bankrupt) {
      if (index <= currentIndex) room.round++;
      room.currentPlayerId = room.players[index].id;
      break;
    }
  }
  room.phase = 'rolling';
  room.pendingProperty = null;
  room.extraRoll = false;
  room.doubleCount = 0;
  room.dice = null;
  log(room, 'Ходит ' + member(room, room.currentPlayerId as string).name, now);
}

function handleBankruptcy(room: OnlineRoomState, debtor: OnlinePlayer, creditor: OnlinePlayer | null, now: number) {
  if (debtor.money >= 0) return;
  debtor.bankrupt = true;
  if (creditor) {
    creditor.properties.push(...debtor.properties);
  }
  debtor.properties = [];
  log(room, debtor.name + ' обанкротился', now);
  if (room.players.filter((p) => !p.bankrupt).length < 2) {
    room.phase = 'finished';
    room.winnerId = room.players.find((p) => !p.bankrupt)?.id ?? null;
  }
}

function rentFor(room: OnlineRoomState, cell: Cell, owner: OnlinePlayer, dice: Dice): number {
  if (cell.type === 'transport') {
    const count = owner.properties.filter((id) => BOARD_CELLS[id].type === 'transport').length;
    return [250_000, 500_000, 1_000_000, 2_000_000][Math.max(0, count - 1)];
  }
  if (cell.type === 'utility') {
    const count = owner.properties.filter((id) => BOARD_CELLS[id].type === 'utility').length;
    return (dice[0] + dice[1]) * (count >= 2 ? 100_000 : 40_000);
  }
  const sameColor = BOARD_CELLS.filter((candidate) => cell.color && candidate.color === cell.color);
  const monopoly = sameColor.length > 0 && sameColor.every((candidate) => owner.properties.includes(candidate.id));
  return (cell.rent?.[0] ?? 0) * (monopoly ? 2 : 1);
}

function land(room: OnlineRoomState, player: OnlinePlayer, dice: Dice, now: number, randomCard: (max: number) => number, hops = 0): void {
  ensure(hops < 4, 'Слишком много последовательных перемещений');
  const cell = BOARD_CELLS[player.position];
  ensure(cell, 'Некорректная клетка');

  if (cell.type === 'go-to-jail') {
    player.position = 10;
    player.jailTurns = 2;
    room.extraRoll = false;
    room.phase = 'end';
    log(room, player.name + ' отправляется в тюрьму', now);
    return;
  }
  if (cell.type === 'tax') {
    const amount = SPECIAL_TAX[cell.id] ?? 0;
    player.money -= amount;
    room.phase = 'end';
    log(room, player.name + ' оплатил налог ' + amount.toLocaleString('ru-RU') + ' ₽', now);
    handleBankruptcy(room, player, null, now);
    return;
  }
  if (cell.type === 'chance' || cell.type === 'trial') {
    const deck = cell.type === 'chance' ? CHANCE_CARDS : TRIAL_CARDS;
    const draw = deck[randomCard(deck.length)];
    ensure(draw, 'Некорректный индекс карты');
    const effect: CardEffect = draw.effect;
    log(room, player.name + ' получил карту ' + draw.textKey, now);
    if (effect.money) player.money += effect.money;
    if (effect.getOutOfJail) player.getOutOfJailCards++;
    if (effect.taxPerProperty) {
      const tax = effect.taxPerProperty;
      player.money -= Number.isInteger(tax)
        ? tax * player.properties.length
        : Math.max(0, Math.floor(player.money * Math.abs(tax)));
    }
    if (effect.collectFromPlayers) {
      for (const other of room.players.filter((p) => p.id !== player.id && !p.bankrupt)) {
        const payment = Math.min(Math.max(0, other.money), effect.collectFromPlayers);
        other.money -= payment;
        player.money += payment;
      }
    }
    if (effect.moveToCell !== undefined) {
      const target = effect.moveToCell;
      if (target < player.position && target === 0) player.money += ONLINE_GO_BONUS;
      player.position = target;
      land(room, player, dice, now, randomCard, hops + 1);
      return;
    }
    room.phase = 'end';
    handleBankruptcy(room, player, null, now);
    return;
  }
  if (cell.price) {
    const owner = room.players.find((p) => p.properties.includes(cell.id));
    if (!owner) {
      room.phase = 'buy';
      room.pendingProperty = cell.id;
      log(room, player.name + ' может купить ' + cell.nameKey, now);
      return;
    }
    if (owner.id !== player.id) {
      const rent = rentFor(room, cell, owner, dice);
      player.money -= rent;
      owner.money += rent;
      log(room, player.name + ' заплатил аренду ' + rent.toLocaleString('ru-RU') + ' ₽', now);
      handleBankruptcy(room, player, owner, now);
    }
  }
  room.phase = room.phase === 'finished' ? 'finished' : 'end';
}

export function applyOnlineAction(
  previous: OnlineRoomState,
  playerId: string,
  action: OnlineAction,
  now = Date.now(),
  rollDice: () => Dice = () => [1, 1],
  randomCard: (max: number) => number = () => 0,
): OnlineRoomState {
  const next = structuredClone(previous);
  const actor = member(next, playerId);

  if (action.type === 'ready') {
    ensure(next.phase === 'lobby', 'Готовность можно менять только до игры');
    actor.ready = action.ready;
    log(next, actor.name + (action.ready ? ' готов' : ' отменил готовность'), now);
  } else if (action.type === 'start') {
    ensure(next.phase === 'lobby', 'Игра уже запущена');
    ensure(playerId === next.hostId, 'Начать может только ведущий');
    ensure(next.players.length >= 2, 'Нужно минимум два игрока');
    ensure(next.players.every((p) => p.ready), 'Все игроки должны быть готовы');
    next.phase = 'rolling';
    next.currentPlayerId = next.players[0].id;
    log(next, 'Игра началась', now);
  } else {
    ensure(next.phase !== 'lobby' && next.phase !== 'finished', 'Игра не активна');
    ensure(next.currentPlayerId === playerId, 'Сейчас не ваш ход');

    if (action.type === 'roll') {
      ensure(next.phase === 'rolling', 'Сейчас нельзя бросать кубики');
      const dice = rollDice();
      ensure(dice.length === 2 && dice.every((n) => Number.isInteger(n) && n >= 1 && n <= 6), 'Недопустимый бросок');
      next.dice = dice;
      const isDouble = dice[0] === dice[1];
      const escapingJail = actor.jailTurns > 0 && isDouble;
      if (actor.jailTurns > 0) {
        if (isDouble) actor.jailTurns = 0;
        else {
          actor.jailTurns--;
          next.extraRoll = false;
          next.phase = 'end';
          log(next, actor.name + ' остаётся в тюрьме', now);
        }
      }
      if (next.phase !== 'end') {
        next.doubleCount = isDouble ? next.doubleCount + 1 : 0;
        if (next.doubleCount >= 3) {
          actor.position = 10;
          actor.jailTurns = 2;
          next.extraRoll = false;
          next.phase = 'end';
          log(next, 'Три дубля: ' + actor.name + ' отправляется в тюрьму', now);
        } else {
          const steps = dice[0] + dice[1];
          const old = actor.position;
          actor.position = (actor.position + steps) % BOARD_CELLS.length;
          if (old + steps >= BOARD_CELLS.length) actor.money += ONLINE_GO_BONUS;
          next.extraRoll = isDouble && !escapingJail;
          log(next, actor.name + ' бросил ' + dice.join('+') + ' и перешёл на ' + actor.position, now);
          land(next, actor, dice, now, randomCard);
        }
      }
    } else if (action.type === 'buy') {
      ensure(next.phase === 'buy' && next.pendingProperty !== null, 'Нечего покупать');
      const cell = BOARD_CELLS[next.pendingProperty];
      ensure(cell && cell.price && actor.money >= cell.price, 'Недостаточно средств');
      ensure(!next.players.some((p) => p.properties.includes(cell.id)), 'Уже куплено');
      actor.money -= cell.price;
      actor.properties.push(cell.id);
      next.pendingProperty = null;
      next.phase = 'end';
      log(next, actor.name + ' купил ' + cell.nameKey, now);
    } else if (action.type === 'pass') {
      ensure(next.phase === 'buy', 'Нет предложения покупки');
      next.pendingProperty = null;
      next.phase = 'end';
      log(next, actor.name + ' отказался от покупки', now);
    } else if (action.type === 'bail') {
      ensure(next.phase === 'rolling' && actor.jailTurns > 0 && actor.money >= ONLINE_BAIL, 'Нельзя оплатить залог');
      actor.money -= ONLINE_BAIL;
      actor.jailTurns = 0;
      log(next, actor.name + ' оплатил залог', now);
    } else if (action.type === 'end') {
      ensure(next.phase === 'end', 'Нельзя завершить ход');
      if (next.extraRoll && actor.jailTurns === 0) {
        next.phase = 'rolling';
        next.extraRoll = false;
        log(next, actor.name + ' получает ещё один бросок', now);
      } else {
        nextTurn(next, now);
      }
    } else {
      throw new OnlineRuleError('Неизвестное действие');
    }
  }
  next.version++;
  next.updatedAt = now;
  return next;
}
