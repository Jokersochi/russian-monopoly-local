import { createServer } from 'node:http';
import { randomBytes, randomInt, randomUUID, createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { WebSocket, WebSocketServer } from 'ws';
import {
  addOnlinePlayer, applyOnlineAction, createOnlineRoom, OnlineRuleError,
  setOnlineConnected, type OnlineRoomState, type OnlineAction,
} from '../src/lib/onlineEngine.ts';

type Session = { playerId: string; tokenHash: string };
type RoomRecord = {
  state: OnlineRoomState;
  sessions: Session[];
  dedupe: string[];
  chat: { id: string; name: string; text: string; at: number }[];
};

const port = Number(process.env.PORT || 8789);
const NODE_ENV = process.env.NODE_ENV || 'development';
const dataFile = resolve(process.env.ONLINE_DATA_FILE || './server/data/rooms.json');
const originList = (process.env.ALLOWED_ORIGINS || (NODE_ENV === 'production' ? '' :
  'http://localhost:8080,http://127.0.0.1:8080,http://localhost:4178,http://127.0.0.1:4178'))
  .split(',').map((s) => s.trim()).filter(Boolean);
if (NODE_ENV === 'production' && originList.length === 0) {
  throw new Error('Production requires ALLOWED_ORIGINS');
}

const rooms = new Map<string, RoomRecord>();
const peers = new Map<WebSocket, { roomId: string; playerId: string }>();
const buckets = new Map<WebSocket, { count: number; resetAt: number }>();
const liveSessions = new Map<string, WebSocket>();

function hash(token: string) { return createHash('sha256').update(token).digest('hex'); }
function hasControlChars(text: string, strict: boolean) {
  return [...text].some((ch) => {
    const cp = ch.charCodeAt(0);
    return cp === 127 || (cp < 32 && (strict || ![9, 10, 13].includes(cp)));
  });
}
function code() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[randomInt(alphabet.length)]).join('');
}
function validName(value: unknown) {
  if (typeof value !== 'string') throw new OnlineRuleError('Некорректное имя');
  const valueTrim = value.trim();
  if (valueTrim.length < 2 || valueTrim.length > 24 || hasControlChars(valueTrim, true) || valueTrim.includes('<') || valueTrim.includes('>')) {
    throw new OnlineRuleError('Имя должно содержать от 2 до 24 символов без управляющих знаков');
  }
  return valueTrim;
}
function getRoom(value: unknown) {
  if (typeof value !== 'string' || !/^[A-Z2-9]{6}$/.test(value)) throw new OnlineRuleError('Некорректный код комнаты');
  const room = rooms.get(value);
  if (!room) throw new OnlineRuleError('Комната не найдена');
  return room;
}
function send(ws: WebSocket, value: object) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(value));
}
function publish(record: RoomRecord) {
  for (const [peer, identity] of peers) {
    if (identity.roomId === record.state.roomId) send(peer, { type: 'state', state: record.state });
  }
}
function save() {
  mkdirSync(dirname(dataFile), { recursive: true });
  const data = JSON.stringify(Array.from(rooms.entries()));
  const tmp = dataFile + '.tmp';
  writeFileSync(tmp, data, { mode: 0o600 });
  renameSync(tmp, dataFile);
}
function restore() {
  if (!existsSync(dataFile)) return;
  const parsed: unknown = JSON.parse(readFileSync(dataFile, 'utf8'));
  if (!Array.isArray(parsed)) throw new Error('Invalid room store');
  for (const pair of parsed) {
    if (!Array.isArray(pair) || pair.length !== 2) throw new Error('Invalid room entry');
    const [id, value] = pair as [string, RoomRecord];
    if (!value?.state || value.state.roomId !== id || !Array.isArray(value.sessions)) throw new Error('Invalid room data');
    value.state.players.forEach((p) => { p.connected = false; });
    value.dedupe ||= [];
    value.chat ||= [];
    rooms.set(id, value);
  }
  console.log('Recovered rooms:', rooms.size);
}
restore();

const server = createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.url === '/health/live') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'alive' }));
  } else if (req.url === '/health/ready') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ready', rooms: rooms.size }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const wss = new WebSocketServer({
  noServer: true,
  maxPayload: 4096,
  clientTracking: true,
});

server.on('upgrade', (req, socket, head) => {
  const origin = req.headers.origin;
  if (req.url !== '/ws' || !origin || !originList.includes(origin)) {
    socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
});

function attach(ws: WebSocket, room: RoomRecord, playerId: string, token?: string) {
  const key = room.state.roomId + ':' + playerId;
  const existing = liveSessions.get(key);
  if (existing && existing !== ws) existing.close(4001, 'Сессия открыта в другом окне');
  liveSessions.set(key, ws);
  peers.set(ws, { roomId: room.state.roomId, playerId });
  room.state = setOnlineConnected(room.state, playerId, true);
  save();
  if (token) send(ws, { type: 'session', roomId: room.state.roomId, playerId, token });
  send(ws, { type: 'chatHistory', messages: room.chat });
  publish(room);
}
function ensureActor(ws: WebSocket) {
  const peer = peers.get(ws);
  if (!peer) throw new OnlineRuleError('Сначала войдите в комнату');
  const record = getRoom(peer.roomId);
  return { peer, record };
}
function enforceRate(ws: WebSocket) {
  const now = Date.now();
  const slot = buckets.get(ws);
  if (!slot || slot.resetAt < now) {
    buckets.set(ws, { count: 1, resetAt: now + 10_000 });
  } else {
    slot.count++;
    if (slot.count > 25) throw new OnlineRuleError('Слишком много запросов');
  }
}
function handle(ws: WebSocket, payload: unknown) {
  enforceRate(ws);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new OnlineRuleError('Некорректная команда');
  const msg = payload as Record<string, unknown>;
  const type = msg.type;
  if (type === 'create') {
    if (peers.has(ws)) throw new OnlineRuleError('Сначала покиньте текущую комнату');
    if (rooms.size >= 250) throw new OnlineRuleError('Превышен лимит комнат');
    const name = validName(msg.name);
    let roomCode = code();
    while (rooms.has(roomCode)) roomCode = code();
    const id = randomUUID();
    const token = randomBytes(32).toString('hex');
    const record: RoomRecord = {
      state: createOnlineRoom(roomCode, id, name),
      sessions: [{ playerId: id, tokenHash: hash(token) }],
      dedupe: [], chat: [],
    };
    rooms.set(roomCode, record);
    attach(ws, record, id, token);
    return;
  }
  if (type === 'join') {
    if (peers.has(ws)) throw new OnlineRuleError('Сначала покиньте текущую комнату');
    const record = getRoom(msg.roomId);
    const name = validName(msg.name);
    const id = randomUUID();
    const token = randomBytes(32).toString('hex');
    record.state = addOnlinePlayer(record.state, id, name);
    record.sessions.push({ playerId: id, tokenHash: hash(token) });
    attach(ws, record, id, token);
    return;
  }
  if (type === 'resume') {
    if (peers.has(ws)) throw new OnlineRuleError('Уже в комнате');
    const record = getRoom(msg.roomId);
    if (typeof msg.token !== 'string' || !/^[a-f0-9]{64}$/.test(msg.token)) throw new OnlineRuleError('Недопустимый токен');
    const identity = record.sessions.find((s) => s.tokenHash === hash(msg.token as string));
    if (!identity) throw new OnlineRuleError('Сессия не найдена');
    attach(ws, record, identity.playerId);
    return;
  }

  const { peer, record } = ensureActor(ws);
  if (type === 'action') {
    if (!msg.action || typeof msg.action !== 'object' || Array.isArray(msg.action)) {
      throw new OnlineRuleError('Некорректное действие');
    }
    const action = msg.action as Record<string, unknown>;
    const types = ['ready', 'start', 'roll', 'buy', 'pass', 'end', 'bail'];
    if (!types.includes(String(action.type))) throw new OnlineRuleError('Действие запрещено');
    if (action.type === 'ready' && typeof action.ready !== 'boolean') throw new OnlineRuleError('ready должен быть boolean');
    if (typeof msg.requestId !== 'string' || msg.requestId.length < 8 || msg.requestId.length > 80) {
      throw new OnlineRuleError('requestId обязателен');
    }
    const commandId = peer.playerId + ':' + msg.requestId;
    if (record.dedupe.includes(commandId)) {
      send(ws, { type: 'ack', requestId: msg.requestId, version: record.state.version, duplicate: true });
      return;
    }
    record.state = applyOnlineAction(
      record.state,
      peer.playerId,
      action as OnlineAction,
      Date.now(),
      () => [randomInt(1, 7), randomInt(1, 7)],
      (size) => randomInt(size),
    );
    record.dedupe.push(commandId);
    if (record.dedupe.length > 1000) record.dedupe.splice(0, record.dedupe.length - 1000);
    save();
    send(ws, { type: 'ack', requestId: msg.requestId, version: record.state.version });
    publish(record);
    return;
  }

  if (type === 'chat') {
    if (typeof msg.text !== 'string' || !msg.text.trim() || msg.text.length > 250) {
      throw new OnlineRuleError('Сообщение должно содержать 1–250 символов');
    }
    const message = msg.text.trim();
    if (hasControlChars(message, false)) throw new OnlineRuleError('Недопустимые символы');
    const actor = record.state.players.find((p) => p.id === peer.playerId);
    if (!actor) throw new OnlineRuleError('Игрок не найден');
    const entry = { id: randomUUID(), name: actor.name, text: message, at: Date.now() };
    record.chat.push(entry);
    if (record.chat.length > 100) record.chat.shift();
    save();
    for (const [client, identity] of peers) {
      if (identity.roomId === record.state.roomId) send(client, { type: 'chat', message: entry });
    }
    return;
  }
  throw new OnlineRuleError('Неизвестная команда');
}

wss.on('connection', (ws) => {
  send(ws, { type: 'hello', boardVersion: 'classic-40-v1' });
  ws.on('message', (raw) => {
    try {
      const parsed = JSON.parse(raw.toString());
      handle(ws, parsed);
    } catch (error) {
      const msg = error instanceof OnlineRuleError ? error.message : 'Некорректный запрос';
      send(ws, { type: 'error', message: msg });
    }
  });
  ws.on('close', () => {
    const identity = peers.get(ws);
    peers.delete(ws);
    buckets.delete(ws);
    if (!identity) return;
    const key = identity.roomId + ':' + identity.playerId;
    if (liveSessions.get(key) !== ws) return;
    liveSessions.delete(key);
    const room = rooms.get(identity.roomId);
    if (!room) return;
    room.state = setOnlineConnected(room.state, identity.playerId, false);
    save();
    publish(room);
  });
});

const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.readyState === WebSocket.OPEN) ws.ping();
  }
}, 30_000);
heartbeat.unref();

server.listen(port, process.env.HOST || '127.0.0.1', () => {
  console.log('Monopoly Luxe online alpha on port ' + port + '; origins=' + originList.length);
});
