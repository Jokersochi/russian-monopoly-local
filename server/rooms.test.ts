import { describe, expect, it } from 'vitest';
import { RoomService } from './rooms';

describe('online rooms and reconnect', () => {
  it('creates a room, reconnects with a stable secret and hides it from snapshots', () => {
    const service = new RoomService();
    const created = service.create('Алиса');
    expect(created.sessionId.length).toBeGreaterThan(30);
    expect(created.room.players).toHaveLength(1);
    const restored = service.get(created.room.roomId, created.sessionId);
    expect(restored.youId).toBe(created.room.youId);
    expect(JSON.stringify(restored)).not.toContain(created.sessionId);
    expect(() => service.get(created.room.roomId, 'invalid')).toThrow('Недействительный ключ');
  });

  it('enforces host authority, turn ownership and optimistic versioning', () => {
    const service = new RoomService();
    const host = service.create('Алиса');
    const guest = service.join(host.room.roomId, 'Борис');
    expect(() => service.start(host.room.roomId, guest.sessionId)).toThrow('только создатель');
    expect(() => service.join(host.room.roomId, 'алиса')).toThrow('Имя уже занято');
    const started = service.start(host.room.roomId, host.sessionId);
    expect(started.game?.players).toHaveLength(2);
    expect(() => service.join(host.room.roomId, 'Вера')).toThrow('Игра уже началась');
    expect(() => service.act(host.room.roomId, guest.sessionId, started.version, 'roll')).toThrow('другого игрока');
    expect(() => service.act(host.room.roomId, host.sessionId, started.version - 1, 'roll')).toThrow('Состояние изменилось');
    const rolled = service.act(host.room.roomId, host.sessionId, started.version, 'roll');
    expect(rolled.version).toBe(started.version + 1);
    expect(() => service.act(host.room.roomId, host.sessionId, started.version, 'roll')).toThrow('Состояние изменилось');
  });

  it('keeps chat history for reconnect and rejects oversized messages', () => {
    const service = new RoomService();
    const host = service.create('Алиса');
    const sent = service.chat(host.room.roomId, host.sessionId, '<b>Привет</b>');
    expect(sent.messages[0].text).toBe('<b>Привет</b>');
    expect(service.get(host.room.roomId, host.sessionId).messages).toHaveLength(1);
    expect(() => service.chat(host.room.roomId, host.sessionId, 'x'.repeat(281))).toThrow('280');
  });

  it('limits room capacity and expires idle rooms', () => {
    const service = new RoomService();
    const host = service.create('Игрок 1');
    for (let index = 2; index <= 6; index++) {
      service.join(host.room.roomId, 'Игрок ' + index);
    }
    expect(() => service.join(host.room.roomId, 'Игрок 7')).toThrow('Комната заполнена');
    service.cleanup(Date.now() + 25 * 60 * 60 * 1000);
    expect(() => service.get(host.room.roomId, host.sessionId)).toThrow('Комната не найдена');
  });
});
