import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOnlineServer } from './http';
import type { RoomSnapshot } from './rooms';

const server = createOnlineServer();
let baseUrl = '';

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = 'http://127.0.0.1:' + (server.address() as AddressInfo).port;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function post(path: string, body: object, token?: string) {
  const response = await fetch(baseUrl + path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}

function snapshots(response: Response) {
  if (!response.body) throw new Error('Missing SSE body');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  return {
    async next(): Promise<RoomSnapshot> {
      while (true) {
        const boundary = pending.indexOf('\n\n');
        if (boundary >= 0) {
          const frame = pending.slice(0, boundary);
          pending = pending.slice(boundary + 2);
          const data = frame.split('\n').find((line) => line.startsWith('data: '));
          if (data) return JSON.parse(data.slice(6)) as RoomSnapshot;
          continue;
        }
        const { done, value } = await reader.read();
        if (done) throw new Error('Stream closed before next snapshot');
        pending += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n');
      }
    },
    async close() {
      await reader.cancel().catch(() => undefined);
    },
  };
}

describe('authenticated real-time room streams', () => {
  it('pushes room and turn updates to both players without polling', async () => {
    const created = await post('/api/rooms', { name: 'Алиса' });
    const roomId = created.data.room.roomId as string;
    const hostToken = created.data.sessionId as string;
    const guest = await post('/api/rooms/' + roomId + '/join', { name: 'Борис' });
    const guestToken = guest.data.sessionId as string;

    const unauthorized = await fetch(baseUrl + '/api/rooms/' + roomId + '/events');
    expect(unauthorized.status).toBe(401);

    const hostAbort = new AbortController();
    const guestAbort = new AbortController();
    const hostResponse = await fetch(baseUrl + '/api/rooms/' + roomId + '/events', {
      headers: { Authorization: 'Bearer ' + hostToken },
      signal: hostAbort.signal,
    });
    const guestResponse = await fetch(baseUrl + '/api/rooms/' + roomId + '/events', {
      headers: { Authorization: 'Bearer ' + guestToken },
      signal: guestAbort.signal,
    });
    expect(hostResponse.status).toBe(200);
    expect(hostResponse.headers.get('content-type')).toContain('text/event-stream');
    expect(guestResponse.status).toBe(200);
    const hostStream = snapshots(hostResponse);
    const guestStream = snapshots(guestResponse);
    try {
      const hostInitial = await hostStream.next();
      const guestInitial = await guestStream.next();
      expect(hostInitial.youId).not.toBe(guestInitial.youId);
      expect(hostInitial.version).toBe(guestInitial.version);

      const started = await post('/api/rooms/' + roomId + '/start', {}, hostToken);
      expect(started.status).toBe(200);
      expect((await hostStream.next()).version).toBe(started.data.version);
      expect((await guestStream.next()).game?.phase).toBe('rolling');

      const rolled = await post('/api/rooms/' + roomId + '/actions', {
        type: 'roll',
        version: started.data.version,
      }, hostToken);
      expect(rolled.status).toBe(200);
      expect((await hostStream.next()).game?.dice).toEqual(rolled.data.game.dice);
      expect((await guestStream.next()).version).toBe(rolled.data.version);
    } finally {
      hostAbort.abort();
      guestAbort.abort();
      await Promise.all([hostStream.close(), guestStream.close()]);
    }
  }, 10_000);
});
