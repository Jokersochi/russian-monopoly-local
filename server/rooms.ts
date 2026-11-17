import { createHash, randomBytes } from 'node:crypto';
import { BOARD_CELLS } from '../src/data/board';
import { applyOnlineAction, createOnlineGame, GameRuleError } from './engine';
import type { OnlineAction, OnlineGame, OnlinePlayer } from './engine';
import type { RoomStore } from './storage';

export class RoomError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'RoomError';
  }
}

interface Seat {
  id: string;
  name: string;
}

interface Session {
  playerId: string;
  lastSeen: number;
  lastChatAt: number;
}

interface ChatMessage {
  id: string;
  playerId: string;
  name: string;
  text: string;
  at: number;
}

interface Room {
  id: string;
  hostId: string;
  seats: Seat[];
  sessions: Map<string, Session>;
  game: OnlineGame | null;
  messages: ChatMessage[];
  version: number;
  updatedAt: number;
}

interface StoredRoom extends Omit<Room, 'sessions'> {
  sessions: [string, Session][];
}

interface Subscriber {
  playerId: string;
  send: (snapshot: RoomSnapshot) => void;
}

export interface RoomSnapshot {
  roomId: string;
  hostId: string;
  youId: string;
  version: number;
  status: 'lobby' | 'playing' | 'finished';
  players: { id: string; name: string; connected: boolean }[];
  game: OnlineGame | null;
  messages: ChatMessage[];
}

const MAX_ROOMS = 500;
const MAX_STREAMS_PER_ROOM = 24;
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const ONLINE_WINDOW_MS = 15_000;
const ROOM_ID_PATTERN = /^[a-f0-9]{10}$/i;
const PLAYER_ID_PATTERN = /^[a-f0-9]{24}$/;
const HASH_PATTERN = /^[a-f0-9]{64}$/;

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonnegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

function isValidPlayer(value: unknown): value is OnlinePlayer {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && PLAYER_ID_PATTERN.test(value.id)
    && typeof value.name === 'string' && value.name.length >= 2 && value.name.length <= 20
    && typeof value.token === 'string' && value.token.length <= 8
    && isNonnegativeNumber(value.money)
    && Number.isInteger(value.position) && (value.position as number) >= 0 && (value.position as number) < BOARD_CELLS.length
    && Array.isArray(value.properties)
    && value.properties.every((id: unknown) => Number.isInteger(id) && (id as number) >= 0 && (id as number) < BOARD_CELLS.length)
    && typeof value.inJail === 'boolean' && Number.isInteger(value.jailTurns)
    && Number.isInteger(value.jailCards) && typeof value.bankrupt === 'boolean';
}

function isValidGame(value: unknown, seats: Seat[]): value is OnlineGame {
  if (!isRecord(value) || !Array.isArray(value.players) || value.players.length !== seats.length) return false;
  if (!value.players.every(isValidPlayer)) return false;
  if (!value.players.every((player: OnlinePlayer, index: number) =>
    player.id === seats[index].id && player.name === seats[index].name)) return false;
  const properties = value.players.flatMap((player: OnlinePlayer) => player.properties);
  if (new Set(properties).size !== properties.length) return false;
  if (!Number.isInteger(value.currentPlayer) || (value.currentPlayer as number) < 0
    || (value.currentPlayer as number) >= seats.length) return false;
  if (!['rolling', 'buying', 'turn-end', 'game-over'].includes(String(value.phase))) return false;
  if (!Number.isInteger(value.round) || (value.round as number) < 1) return false;
  if (!Number.isInteger(value.maxRounds) || (value.maxRounds as number) < 1 || (value.maxRounds as number) > 100) return false;
  if (!Number.isInteger(value.doubleCount) || (value.doubleCount as number) < 0 || (value.doubleCount as number) > 2) return false;
  if (value.dice !== null && (!Array.isArray(value.dice) || value.dice.length !== 2
    || !value.dice.every((die: unknown) => Number.isInteger(die) && (die as number) >= 1 && (die as number) <= 6))) return false;
  return typeof value.lastEvent === 'string' && value.lastEvent.length <= 500
    && (value.winnerId === null || seats.some((seat) => seat.id === value.winnerId));
}

function restoreRoom(value: unknown): Room {
  if (!isRecord(value) || typeof value.id !== 'string' || !ROOM_ID_PATTERN.test(value.id)
    || typeof value.hostId !== 'string' || !Array.isArray(value.seats)
    || value.seats.length < 1 || value.seats.length > 6
    || !value.seats.every((seat: unknown) => isRecord(seat)
      && typeof seat.id === 'string' && PLAYER_ID_PATTERN.test(seat.id)
      && typeof seat.name === 'string' && seat.name.length >= 2 && seat.name.length <= 20)
    || !value.seats.some((seat: Seat) => seat.id === value.hostId)
    || new Set(value.seats.map((seat: Seat) => seat.id)).size !== value.seats.length
    || !Array.isArray(value.sessions) || value.sessions.length > 36
    || !value.sessions.every((entry: unknown) => Array.isArray(entry) && entry.length === 2
      && typeof entry[0] === 'string' && HASH_PATTERN.test(entry[0])
      && isRecord(entry[1]) && (value.seats as Seat[]).some((seat) => seat.id === entry[1].playerId)
      && isNonnegativeNumber(entry[1].lastSeen) && isNonnegativeNumber(entry[1].lastChatAt))
    || !Array.isArray(value.messages) || value.messages.length > 60
    || !value.messages.every((message: unknown) => isRecord(message)
      && typeof message.id === 'string' && message.id.length <= 32
      && typeof message.playerId === 'string' && (value.seats as Seat[]).some((seat) => seat.id === message.playerId)
      && typeof message.name === 'string' && message.name.length <= 20
      && typeof message.text === 'string' && message.text.length >= 1 && message.text.length <= 280
      && isNonnegativeNumber(message.at))
    || !Number.isSafeInteger(value.version) || (value.version as number) < 1
    || !isNonnegativeNumber(value.updatedAt)
    || (value.game !== null && !isValidGame(value.game, value.seats as Seat[]))) {
    throw new Error('Invalid online room snapshot; refusing to overwrite stored games');
  }
  return {
    id: value.id,
    hostId: value.hostId as string,
    seats: value.seats as Seat[],
    sessions: new Map(value.sessions as [string, Session][]),
    game: value.game as OnlineGame | null,
    messages: value.messages as ChatMessage[],
    version: value.version as number,
    updatedAt: value.updatedAt,
  };
}

function normalizeName(name: unknown): string {
  if (typeof name !== 'string') throw new RoomError(400, 'Укажите имя игрока');
  const normalized = name.trim().replace(/\s+/g, ' ');
  if (normalized.length < 2 || normalized.length > 20 || [...normalized].some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  })) {
    throw new RoomError(400, 'Имя должно содержать от 2 до 20 символов');
  }
  return normalized;
}

export class RoomService {
  private readonly rooms = new Map<string, Room>();
  private readonly listeners = new Map<string, Set<Subscriber>>();

  constructor(private readonly store?: RoomStore) {
    if (!store) return;
    const data = store.load();
    if (!isRecord(data) || data.schema !== 1 || !Array.isArray(data.rooms)
      || data.rooms.length > MAX_ROOMS) {
      throw new Error('Invalid online snapshot schema; refusing to overwrite stored games');
    }
    for (const entry of data.rooms) {
      const room = restoreRoom(entry);
      if (this.rooms.has(room.id)) throw new Error('Duplicate room in online snapshot');
      // Connections are ephemeral, but hashed session tokens survive restarts.
      for (const session of room.sessions.values()) session.lastSeen = 0;
      this.rooms.set(room.id, room);
    }
  }

  private getRoom(roomId: string): Room {
    const room = this.rooms.get(roomId.toUpperCase());
    if (!room) throw new RoomError(404, 'Комната не найдена или срок хранения истёк');
    return room;
  }

  private authorize(room: Room, token: string): Session {
    if (!token || token.length > 200) throw new RoomError(401, 'Требуется ключ игрока');
    const session = room.sessions.get(tokenHash(token));
    if (!session) throw new RoomError(401, 'Недействительный ключ игрока');
    session.lastSeen = Date.now();
    room.updatedAt = Date.now();
    return session;
  }

  private issueSession(room: Room, playerId: string): string {
    const token = randomBytes(32).toString('base64url');
    room.sessions.set(tokenHash(token), { playerId, lastSeen: Date.now(), lastChatAt: 0 });
    return token;
  }

  private snapshot(room: Room, playerId: string): RoomSnapshot {
    const now = Date.now();
    return {
      roomId: room.id,
      hostId: room.hostId,
      youId: playerId,
      version: room.version,
      status: !room.game ? 'lobby' : room.game.phase === 'game-over' ? 'finished' : 'playing',
      players: room.seats.map((seat) => ({
        ...seat,
        connected: [...room.sessions.values()].some(
          (session) => session.playerId === seat.id && now - session.lastSeen < ONLINE_WINDOW_MS,
        ),
      })),
      game: room.game ? structuredClone(room.game) : null,
      messages: room.messages.map((message) => ({ ...message })),
    };
  }

  private serialize(room: Room): StoredRoom {
    return {
      id: room.id,
      hostId: room.hostId,
      seats: room.seats,
      sessions: [...room.sessions.entries()],
      game: room.game,
      messages: room.messages,
      version: room.version,
      updatedAt: room.updatedAt,
    };
  }

  private persist(): void {
    this.store?.save({ schema: 1, rooms: [...this.rooms.values()].map((room) => this.serialize(room)) });
  }

  private notify(roomId: string): void {
    const room = this.rooms.get(roomId);
    const subscribers = this.listeners.get(roomId);
    if (!room || !subscribers) return;
    for (const subscriber of [...subscribers]) {
      try {
        subscriber.send(this.snapshot(room, subscriber.playerId));
      } catch {
        subscribers.delete(subscriber);
      }
    }
  }

  private commit(room: Room, mutation: () => void): void {
    const backup = structuredClone(this.serialize(room));
    try {
      mutation();
      this.persist();
    } catch (error) {
      this.rooms.set(room.id, restoreRoom(backup));
      throw error;
    }
    this.notify(room.id);
  }

  cleanup(now = Date.now()): void {
    const removed: Room[] = [];
    for (const [id, room] of this.rooms) {
      if (now - room.updatedAt > ROOM_TTL_MS) {
        removed.push(room);
        this.rooms.delete(id);
      }
    }
    if (!removed.length) return;
    try {
      this.persist();
    } catch (error) {
      for (const room of removed) this.rooms.set(room.id, room);
      throw error;
    }
    for (const room of removed) this.listeners.delete(room.id);
  }

  create(name: unknown): { sessionId: string; room: RoomSnapshot } {
    this.cleanup();
    if (this.rooms.size >= MAX_ROOMS) throw new RoomError(429, 'Сервер перегружен, повторите позже');
    const playerName = normalizeName(name);
    const playerId = randomBytes(12).toString('hex');
    let roomId: string;
    do {
      roomId = randomBytes(5).toString('hex').toUpperCase();
    } while (this.rooms.has(roomId));
    const room: Room = {
      id: roomId,
      hostId: playerId,
      seats: [{ id: playerId, name: playerName }],
      sessions: new Map(),
      game: null,
      messages: [],
      version: 1,
      updatedAt: Date.now(),
    };
    const sessionId = this.issueSession(room, playerId);
    this.rooms.set(roomId, room);
    try {
      this.persist();
    } catch (error) {
      this.rooms.delete(roomId);
      throw error;
    }
    return { sessionId, room: this.snapshot(room, playerId) };
  }

  join(roomId: string, name: unknown): { sessionId: string; room: RoomSnapshot } {
    const room = this.getRoom(roomId);
    if (room.game) throw new RoomError(409, 'Игра уже началась');
    if (room.seats.length >= 6) throw new RoomError(409, 'Комната заполнена');
    const playerName = normalizeName(name);
    if (room.seats.some((seat) => seat.name.toLocaleLowerCase() === playerName.toLocaleLowerCase())) {
      throw new RoomError(409, 'Имя уже занято в этой комнате');
    }
    const playerId = randomBytes(12).toString('hex');
    let sessionId = '';
    this.commit(room, () => {
      room.seats.push({ id: playerId, name: playerName });
      room.version++;
      room.updatedAt = Date.now();
      sessionId = this.issueSession(room, playerId);
    });
    return { sessionId, room: this.snapshot(this.getRoom(roomId), playerId) };
  }

  get(roomId: string, token: string): RoomSnapshot {
    const room = this.getRoom(roomId);
    const session = this.authorize(room, token);
    return this.snapshot(room, session.playerId);
  }

  start(roomId: string, token: string, maxRounds = 30): RoomSnapshot {
    const room = this.getRoom(roomId);
    const session = this.authorize(room, token);
    if (session.playerId !== room.hostId) throw new RoomError(403, 'Начать игру может только создатель');
    if (room.game) throw new RoomError(409, 'Игра уже началась');
    this.commit(room, () => {
      try {
        room.game = createOnlineGame(room.seats, maxRounds);
      } catch (error) {
        if (error instanceof GameRuleError) throw new RoomError(400, error.message);
        throw error;
      }
      room.version++;
    });
    return this.snapshot(this.getRoom(roomId), session.playerId);
  }

  act(roomId: string, token: string, version: unknown, action: unknown): RoomSnapshot {
    const room = this.getRoom(roomId);
    const session = this.authorize(room, token);
    if (!room.game) throw new RoomError(409, 'Игра ещё не началась');
    if (!Number.isSafeInteger(version) || version !== room.version) {
      throw new RoomError(409, 'Состояние изменилось, обновите игру');
    }
    if (!['roll', 'buy', 'pass', 'end-turn', 'pay-bail'].includes(String(action))) {
      throw new RoomError(400, 'Неизвестное действие');
    }
    this.commit(room, () => {
      try {
        room.game = applyOnlineAction(room.game!, session.playerId, action as OnlineAction);
      } catch (error) {
        if (error instanceof GameRuleError) throw new RoomError(409, error.message);
        throw error;
      }
      room.version++;
    });
    return this.snapshot(this.getRoom(roomId), session.playerId);
  }

  chat(roomId: string, token: string, text: unknown): RoomSnapshot {
    const room = this.getRoom(roomId);
    const session = this.authorize(room, token);
    if (typeof text !== 'string' || text.trim().length < 1 || text.trim().length > 280) {
      throw new RoomError(400, 'Сообщение должно содержать от 1 до 280 символов');
    }
    if (Date.now() - session.lastChatAt < 750) throw new RoomError(429, 'Подождите перед отправкой сообщения');
    const seat = room.seats.find((item) => item.id === session.playerId);
    if (!seat) throw new RoomError(403, 'Игрок не найден');
    this.commit(room, () => {
      session.lastChatAt = Date.now();
      room.messages.push({
        id: randomBytes(10).toString('hex'),
        playerId: seat.id,
        name: seat.name,
        text: text.trim(),
        at: Date.now(),
      });
      room.messages = room.messages.slice(-60);
      room.version++;
    });
    return this.snapshot(this.getRoom(roomId), session.playerId);
  }

  subscribe(
    roomId: string,
    token: string,
    send: (snapshot: RoomSnapshot) => void,
  ): { snapshot: RoomSnapshot; unsubscribe: () => void } {
    const room = this.getRoom(roomId);
    const session = this.authorize(room, token);
    let subscribers = this.listeners.get(room.id);
    if (!subscribers) {
      subscribers = new Set();
      this.listeners.set(room.id, subscribers);
    }
    if (subscribers.size >= MAX_STREAMS_PER_ROOM) throw new RoomError(429, 'Слишком много подключений');
    const subscriber: Subscriber = { playerId: session.playerId, send };
    subscribers.add(subscriber);
    return {
      snapshot: this.snapshot(room, session.playerId),
      unsubscribe: () => {
        subscribers?.delete(subscriber);
        if (subscribers?.size === 0) this.listeners.delete(room.id);
      },
    };
  }

  touch(roomId: string, token: string): void {
    const room = this.getRoom(roomId);
    this.authorize(room, token);
    this.notify(room.id);
  }
}
