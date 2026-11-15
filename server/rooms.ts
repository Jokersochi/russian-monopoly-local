import { createHash, randomBytes } from 'node:crypto';
import { applyOnlineAction, createOnlineGame, GameRuleError } from './engine';
import type { OnlineAction, OnlineGame } from './engine';

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
const ROOM_TTL_MS = 24 * 60 * 60 * 1000;
const ONLINE_WINDOW_MS = 15_000;

function tokenHash(token: string): string {
  return createHash('sha256').update(token).digest('hex');
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

  cleanup(now = Date.now()): void {
    for (const [id, room] of this.rooms) {
      if (now - room.updatedAt > ROOM_TTL_MS) this.rooms.delete(id);
    }
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
    this.rooms.set(roomId, room);
    const sessionId = this.issueSession(room, playerId);
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
    room.seats.push({ id: playerId, name: playerName });
    room.version++;
    room.updatedAt = Date.now();
    const sessionId = this.issueSession(room, playerId);
    return { sessionId, room: this.snapshot(room, playerId) };
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
    try {
      room.game = createOnlineGame(room.seats, maxRounds);
    } catch (error) {
      if (error instanceof GameRuleError) throw new RoomError(400, error.message);
      throw error;
    }
    room.version++;
    return this.snapshot(room, session.playerId);
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
    try {
      room.game = applyOnlineAction(room.game, session.playerId, action as OnlineAction);
    } catch (error) {
      if (error instanceof GameRuleError) throw new RoomError(409, error.message);
      throw error;
    }
    room.version++;
    return this.snapshot(room, session.playerId);
  }

  chat(roomId: string, token: string, text: unknown): RoomSnapshot {
    const room = this.getRoom(roomId);
    const session = this.authorize(room, token);
    if (typeof text !== 'string' || text.trim().length < 1 || text.trim().length > 280) {
      throw new RoomError(400, 'Сообщение должно содержать от 1 до 280 символов');
    }
    if (Date.now() - session.lastChatAt < 750) throw new RoomError(429, 'Подождите перед отправкой сообщения');
    session.lastChatAt = Date.now();
    const seat = room.seats.find((item) => item.id === session.playerId);
    if (!seat) throw new RoomError(403, 'Игрок не найден');
    room.messages.push({
      id: randomBytes(10).toString('hex'),
      playerId: seat.id,
      name: seat.name,
      text: text.trim(),
      at: Date.now(),
    });
    room.messages = room.messages.slice(-60);
    room.version++;
    return this.snapshot(room, session.playerId);
  }
}
