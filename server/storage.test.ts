import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { RoomService } from './rooms';
import { JsonRoomStore } from './storage';
import type { RoomStore } from './storage';

const directories: string[] = [];
function newStore() {
  const directory = mkdtempSync(join(tmpdir(), 'monopoly-online-'));
  directories.push(directory);
  const filename = join(directory, 'data', 'rooms.json');
  return { filename, store: new JsonRoomStore(filename) };
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe('durable online rooms', () => {
  it('restores players, room, chat and game state with the original session keys', () => {
    const { filename, store } = newStore();
    const first = new RoomService(store);
    const host = first.create('Алиса');
    const guest = first.join(host.room.roomId, 'Борис');
    first.chat(host.room.roomId, host.sessionId, 'Сыграем!');
    const started = first.start(host.room.roomId, host.sessionId, 12);
    const rolled = first.act(host.room.roomId, host.sessionId, started.version, 'roll');
    expect(rolled.game?.dice).not.toBeNull();

    const second = new RoomService(new JsonRoomStore(filename));
    const restoredHost = second.get(host.room.roomId, host.sessionId);
    const restoredGuest = second.get(host.room.roomId, guest.sessionId);
    expect(restoredHost.version).toBe(rolled.version);
    expect(restoredHost.game).toEqual(rolled.game);
    expect(restoredHost.messages[0].text).toBe('Сыграем!');
    expect(restoredGuest.youId).toBe(guest.room.youId);
    expect(restoredHost.players.every((player) => !player.connected || player.id === restoredHost.youId)).toBe(true);

    const disk = readFileSync(filename, 'utf8');
    expect(disk).not.toContain(host.sessionId);
    expect(disk).not.toContain(guest.sessionId);
    expect(JSON.parse(disk).schema).toBe(1);
    if (process.platform !== 'win32') expect(statSync(filename).mode & 0o777).toBe(0o600);
  });

  it('refuses corrupt or incompatible snapshots without overwriting them', () => {
    const { filename } = newStore();
    writeFileSync(filename, '{"schema":2,"rooms":[]}', 'utf8');
    expect(() => new RoomService(new JsonRoomStore(filename))).toThrow('Invalid online snapshot schema');
    expect(readFileSync(filename, 'utf8')).toContain('"schema":2');
    writeFileSync(filename, '{"schema":1,"rooms":[{"id":"bad"}]}', 'utf8');
    expect(() => new RoomService(new JsonRoomStore(filename))).toThrow('Invalid online room snapshot');
    writeFileSync(filename, '{broken', 'utf8');
    expect(() => new RoomService(new JsonRoomStore(filename))).toThrow(SyntaxError);
  });

  it('rolls back in-memory mutations when the durable write fails', () => {
    let fail = false;
    let lastSnapshot: unknown = { schema: 1, rooms: [] };
    const store: RoomStore = {
      load: () => lastSnapshot,
      save: (value) => {
        if (fail) throw new Error('disk full');
        lastSnapshot = structuredClone(value);
      },
    };
    const service = new RoomService(store);
    const host = service.create('Алиса');
    fail = true;
    expect(() => service.join(host.room.roomId, 'Борис')).toThrow('disk full');
    expect(service.get(host.room.roomId, host.sessionId).players).toHaveLength(1);
    fail = false;
    const guest = service.join(host.room.roomId, 'Борис');
    const started = service.start(host.room.roomId, host.sessionId);
    fail = true;
    expect(() => service.act(host.room.roomId, host.sessionId, started.version, 'roll')).toThrow('disk full');
    expect(service.get(host.room.roomId, host.sessionId).version).toBe(started.version);
    expect(service.get(host.room.roomId, guest.sessionId).game?.dice).toBeNull();
  });

  it('keeps session credentials private and restores an idle room after service restart', () => {
    const { filename, store } = newStore();
    const first = new RoomService(store);
    const host = first.create('Алиса');
    const second = new RoomService(new JsonRoomStore(filename));
    expect(second.get(host.room.roomId, host.sessionId).youId).toBe(host.room.youId);
    expect(() => second.get(host.room.roomId, 'invalid')).toThrow('Недействительный ключ');
  });
});
