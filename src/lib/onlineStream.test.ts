import { describe, expect, it } from 'vitest';
import { parseSnapshotFrame } from './onlineStream';

describe('online event stream parsing', () => {
  it('ignores SSE comments and non-snapshot events', () => {
    expect(parseSnapshotFrame(': ping')).toBeNull();
    expect(parseSnapshotFrame('event: other\ndata: {}')).toBeNull();
  });

  it('accepts valid JSON snapshots and ignores event whitespace', () => {
    const snapshot = { roomId: 'AB12CD34EF', version: 7, players: [] };
    expect(parseSnapshotFrame('event: snapshot\ndata: ' + JSON.stringify(snapshot))).toEqual(snapshot);
  });

  it('rejects malformed and unexpected payloads', () => {
    expect(() => parseSnapshotFrame('event: snapshot\ndata: {')).toThrow();
    expect(() => parseSnapshotFrame('event: snapshot\ndata: {"roomId":"X","version":"bad","players":[]}')).toThrow('Некорректное');
  });
});
