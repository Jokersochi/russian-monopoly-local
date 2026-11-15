import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { RoomError, RoomService } from './rooms';
import type { RoomSnapshot } from './rooms';

const MAX_BODY_BYTES = 8 * 1024;
const HEARTBEAT_MS = 10_000;

function respond(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

async function parseBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    throw new RoomError(415, 'Ожидается application/json');
  }
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new RoomError(413, 'Слишком большой запрос');
    chunks.push(buffer);
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid body');
    return value as Record<string, unknown>;
  } catch {
    throw new RoomError(400, 'Некорректный JSON');
  }
}

function bearerToken(request: IncomingMessage): string {
  const header = request.headers.authorization ?? '';
  const match = /^Bearer ([A-Za-z0-9_-]{20,200})$/.exec(header);
  if (!match) throw new RoomError(401, 'Требуется ключ игрока');
  return match[1];
}

/** Streams per-player snapshots without exposing session credentials in URLs. */
function streamRoom(
  request: IncomingMessage,
  response: ServerResponse,
  service: RoomService,
  roomId: string,
): void {
  const token = bearerToken(request);
  const send = (snapshot: RoomSnapshot) => {
    if (response.destroyed || response.writableEnded) return;
    if (!response.write('event: snapshot\ndata: ' + JSON.stringify(snapshot) + '\n\n')) {
      // A stalled client must not consume unbounded memory on the server.
      response.destroy();
    }
  };
  // Authenticate and register before sending any response headers.
  const subscription = service.subscribe(roomId, token, send);
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'X-Content-Type-Options': 'nosniff',
  });
  response.flushHeaders();
  send(subscription.snapshot);

  const heartbeat = setInterval(() => {
    if (response.destroyed || response.writableEnded) return;
    try {
      service.touch(roomId, token);
      if (!response.write(': ping\n\n')) response.destroy();
    } catch {
      response.end();
    }
  }, HEARTBEAT_MS);
  heartbeat.unref();
  response.once('close', () => {
    clearInterval(heartbeat);
    subscription.unsubscribe();
  });
}

export function createOnlineServer(service = new RoomService()) {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? '/', 'http://localhost');
      const method = request.method;
      if (method === 'GET' && url.pathname === '/api/health') {
        respond(response, 200, { ok: true, service: 'russian-monopoly-online' });
        return;
      }
      if (method === 'POST' && url.pathname === '/api/rooms') {
        const body = await parseBody(request);
        respond(response, 201, service.create(body.name));
        return;
      }
      const match = /^\/api\/rooms\/([a-f0-9]{10})(?:\/(join|start|actions|chat|events))?$/i.exec(url.pathname);
      if (!match) throw new RoomError(404, 'Маршрут не найден');
      const roomId = match[1];
      const route = match[2];
      if (method === 'POST' && route === 'join') {
        const body = await parseBody(request);
        respond(response, 201, service.join(roomId, body.name));
        return;
      }
      if (method === 'GET' && route === 'events') {
        streamRoom(request, response, service, roomId);
        return;
      }
      const token = bearerToken(request);
      if (method === 'GET' && !route) {
        respond(response, 200, service.get(roomId, token));
        return;
      }
      if (method === 'POST' && route === 'start') {
        const body = await parseBody(request);
        respond(response, 200, service.start(roomId, token, body.maxRounds === undefined ? 30 : body.maxRounds as number));
        return;
      }
      if (method === 'POST' && route === 'actions') {
        const body = await parseBody(request);
        respond(response, 200, service.act(roomId, token, body.version, body.type));
        return;
      }
      if (method === 'POST' && route === 'chat') {
        const body = await parseBody(request);
        respond(response, 200, service.chat(roomId, token, body.text));
        return;
      }
      throw new RoomError(404, 'Маршрут не найден');
    } catch (error) {
      if (response.headersSent) {
        response.destroy();
        return;
      }
      if (error instanceof RoomError) {
        respond(response, error.status, { error: error.message });
      } else {
        console.error('Online API error', error);
        respond(response, 500, { error: 'Внутренняя ошибка сервера' });
      }
    }
  });
}
