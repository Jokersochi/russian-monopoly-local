import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createOnlineServer } from './http';

const server = createOnlineServer();
let baseUrl: string;

beforeAll(async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;
  baseUrl = 'http://127.0.0.1:' + address.port;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

async function request(path: string, method = 'GET', token?: string, body?: object) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}

describe('HTTP room protocol', () => {
  it('creates, joins, restores and enforces authorization on game actions', async () => {
    expect((await request('/api/health')).status).toBe(200);
    const created = await request('/api/rooms', 'POST', undefined, { name: 'Алиса' });
    expect(created.status).toBe(201);
    const roomId = created.data.room.roomId as string;
    const hostToken = created.data.sessionId as string;
    const unauthorized = await request('/api/rooms/' + roomId);
    expect(unauthorized.status).toBe(401);
    const guest = await request('/api/rooms/' + roomId + '/join', 'POST', undefined, { name: 'Борис' });
    expect(guest.status).toBe(201);
    const restored = await request('/api/rooms/' + roomId, 'GET', hostToken);
    expect(restored.data.roomId).toBe(roomId);
    const forbidden = await request('/api/rooms/' + roomId + '/start', 'POST', guest.data.sessionId, {});
    expect(forbidden.status).toBe(403);
    const started = await request('/api/rooms/' + roomId + '/start', 'POST', hostToken, {});
    expect(started.status).toBe(200);
    const wrongTurn = await request('/api/rooms/' + roomId + '/actions', 'POST', guest.data.sessionId, {
      version: started.data.version, type: 'roll', dice: [6, 6],
    });
    expect(wrongTurn.status).toBe(409);
    const rolled = await request('/api/rooms/' + roomId + '/actions', 'POST', hostToken, {
      version: started.data.version, type: 'roll', dice: [6, 6],
    });
    expect(rolled.status).toBe(200);
    expect(rolled.data.game.dice).toHaveLength(2);
    expect((await request('/api/rooms/' + roomId + '/actions', 'POST', hostToken, {
      version: started.data.version, type: 'roll',
    })).status).toBe(409);
  });
  it('rejects invalid JSON, wrong content type and missing routes', async () => {
    const invalid = await fetch(baseUrl + '/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });
    expect(invalid.status).toBe(400);
    const wrongType = await fetch(baseUrl + '/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'name=alice',
    });
    expect(wrongType.status).toBe(415);
    expect((await request('/api/missing')).status).toBe(404);
    expect((await request('/api/rooms', 'POST', undefined, { name: 'x' })).status).toBe(400);
  });

});
