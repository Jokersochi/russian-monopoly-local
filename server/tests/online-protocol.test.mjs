import { spawn } from 'node:child_process';
import { randomInt, randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';

const origin = 'http://127.0.0.1:4181';
const root = resolve(import.meta.dirname, '../..');

function send(ws, message) { ws.send(JSON.stringify(message)); }
function makeClient(port) {
  const ws = new WebSocket('ws://127.0.0.1:' + port + '/ws', { headers: { Origin: origin } });
  const history = [];
  ws.on('message', (raw) => {
    try { history.push(JSON.parse(raw.toString())); } catch { /* ignored */ }
  });
  async function waitFor(type, predicate = () => true, timeout = 4000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const index = history.findIndex((msg) => msg.type === type && predicate(msg));
      if (index >= 0) return history.splice(index, 1)[0];
      await delay(20);
    }
    throw new Error('Timed out waiting for ' + type + '; history=' + JSON.stringify(history.slice(-5)));
  }
  return { ws, history, waitFor };
}
async function boot(port, file) {
  const child = spawn(process.execPath, ['dist-server/index.mjs'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port),
      ALLOWED_ORIGINS: origin, ONLINE_DATA_FILE: file },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  let stderr = '';
  child.stderr.on('data', (data) => { stderr += data.toString(); });
  for (let i = 0; i < 100; i++) {
    if (child.exitCode !== null) throw new Error('Server died: ' + stderr);
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/health/ready');
      if (res.ok) return child;
    } catch { /* starting */ }
    await delay(35);
  }
  child.kill();
  throw new Error('Server did not start: ' + stderr);
}

test('two clients, host permissions, idempotency, reconnect and restart', { timeout: 30000 }, async () => {
  const port = randomInt(20000, 35000);
  const temp = mkdtempSync(join(tmpdir(), 'monopoly-ws-'));
  const file = join(temp, 'rooms.json');
  let server;
  const sockets = [];
  try {
    server = await boot(port, file);
    const alice = makeClient(port); sockets.push(alice.ws);
    await alice.waitFor('hello');
    send(alice.ws, { type: 'create', name: 'Алиса' });
    const host = await alice.waitFor('session');
    assert.equal(host.token.length, 64);
    const roomId = host.roomId;
    await alice.waitFor('state', (m) => m.state.players.length === 1);

    const bob = makeClient(port); sockets.push(bob.ws);
    await bob.waitFor('hello');
    send(bob.ws, { type: 'join', roomId, name: 'Борис' });
    const guest = await bob.waitFor('session');
    assert.notEqual(guest.playerId, host.playerId);
    await alice.waitFor('state', (m) => m.state.players.length === 2);
    await bob.waitFor('state', (m) => m.state.players.length === 2);

    const req = (action) => ({ type: 'action', action, requestId: randomUUID() });
    send(bob.ws, req({ type: 'start' }));
    assert.match((await bob.waitFor('error')).message, /ведущий|готов/i);

    send(alice.ws, req({ type: 'ready', ready: true }));
    await alice.waitFor('ack');
    send(bob.ws, req({ type: 'ready', ready: true }));
    await bob.waitFor('ack');
    send(alice.ws, req({ type: 'start' }));
    await alice.waitFor('ack');

    const oldVersion = (await alice.waitFor('state', (m) => m.state.phase === 'rolling')).state.version;
    const rollReq = req({ type: 'roll' });
    send(bob.ws, rollReq);
    assert.match((await bob.waitFor('error')).message, /не ваш ход/i);
    send(alice.ws, rollReq);
    const rollAck = await alice.waitFor('ack', (m) => m.requestId === rollReq.requestId);
    assert.equal(rollAck.version, oldVersion + 1);
    send(alice.ws, rollReq);
    const dup = await alice.waitFor('ack', (m) => m.requestId === rollReq.requestId);
    assert.equal(dup.duplicate, true);

    send(bob.ws, { type: 'chat', text: 'Проверка чата' });
    const chat = await alice.waitFor('chat', (m) => m.message.text === 'Проверка чата');
    assert.equal(chat.message.name, 'Борис');

    bob.ws.close();
    await delay(150);
    const resumed = makeClient(port); sockets.push(resumed.ws);
    await resumed.waitFor('hello');
    send(resumed.ws, { type: 'resume', roomId, token: guest.token });
    const snapshot = await resumed.waitFor('state', (m) => m.state.players.length === 2);
    assert.equal(snapshot.state.players.find((p) => p.id === guest.playerId)?.connected, true);

    const fake = makeClient(port); sockets.push(fake.ws);
    await fake.waitFor('hello');
    send(fake.ws, { type: 'resume', roomId, token: 'a'.repeat(64) });
    assert.match((await fake.waitFor('error')).message, /не найдена/i);

    for (const ws of sockets) ws.close();
    server.kill();
    await delay(200);
    server = await boot(port, file);
    const afterRestart = makeClient(port); sockets.push(afterRestart.ws);
    await afterRestart.waitFor('hello');
    send(afterRestart.ws, { type: 'resume', roomId, token: host.token });
    const restored = await afterRestart.waitFor('state', (m) => m.state.roomId === roomId);
    assert.equal(restored.state.players.length, 2);
    assert.ok(restored.state.version >= oldVersion + 1);
  } finally {
    for (const ws of sockets) ws.terminate();
    server?.kill();
    rmSync(temp, { recursive: true, force: true });
  }
});
