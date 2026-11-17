import type { OnlineSnapshot } from './online';

export function parseSnapshotFrame(frame: string): OnlineSnapshot | null {
  const lines = frame.split('\n');
  if (!lines.some((line) => line.trim() === 'event: snapshot')) return null;
  const data = lines.filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart()).join('\n');
  if (!data) return null;
  const snapshot: unknown = JSON.parse(data);
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)
    || !('roomId' in snapshot) || typeof snapshot.roomId !== 'string'
    || !('version' in snapshot) || typeof snapshot.version !== 'number'
    || !('players' in snapshot) || !Array.isArray(snapshot.players)) {
    throw new Error('Некорректное событие сервера');
  }
  return snapshot as OnlineSnapshot;
}

/**
 * Uses fetch instead of EventSource so the session token stays in the
 * Authorization header rather than a shareable URL or browser history.
 */
export async function streamOnlineRoom(
  roomId: string,
  token: string,
  signal: AbortSignal,
  onSnapshot: (snapshot: OnlineSnapshot) => void,
  onConnected: () => void,
): Promise<void> {
  const response = await fetch('/api/rooms/' + roomId + '/events', {
    headers: { Authorization: 'Bearer ' + token },
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    const error = new Error(response.status === 401 ? 'Сессия недействительна' : 'Не удалось подключиться к комнате') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (!response.body) throw new Error('Поток событий недоступен');
  onConnected();
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '';
  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      pending = pending.replace(/\r\n/g, '\n');
      if (pending.length > 1024 * 1024) throw new Error('Слишком большое событие сервера');
      let boundary = pending.indexOf('\n\n');
      while (boundary >= 0) {
        const frame = pending.slice(0, boundary);
        pending = pending.slice(boundary + 2);
        const snapshot = parseSnapshotFrame(frame);
        if (snapshot) onSnapshot(snapshot);
        boundary = pending.indexOf('\n\n');
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
