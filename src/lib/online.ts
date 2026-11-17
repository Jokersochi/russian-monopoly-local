export interface OnlinePlayer {
  id: string;
  name: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  jailCards: number;
  bankrupt: boolean;
}

export interface OnlineGame {
  players: OnlinePlayer[];
  currentPlayer: number;
  phase: 'rolling' | 'buying' | 'turn-end' | 'game-over';
  round: number;
  maxRounds: number;
  dice: [number, number] | null;
  doubleCount: number;
  lastEvent: string;
  winnerId: string | null;
}

export interface OnlineSnapshot {
  roomId: string;
  hostId: string;
  youId: string;
  version: number;
  status: 'lobby' | 'playing' | 'finished';
  players: { id: string; name: string; connected: boolean }[];
  game: OnlineGame | null;
  messages: { id: string; playerId: string; name: string; text: string; at: number }[];
}

export interface OnlineSession {
  sessionId: string;
  room: OnlineSnapshot;
}

export function getRoomToken(roomId: string): string | null {
  try {
    return localStorage.getItem('monopoly-online-' + roomId);
  } catch {
    return null;
  }
}

export function saveRoomToken(roomId: string, token: string): void {
  localStorage.setItem('monopoly-online-' + roomId, token);
}

export function clearRoomToken(roomId: string): void {
  localStorage.removeItem('monopoly-online-' + roomId);
}

export async function onlineRequest<T>(
  path: string,
  method: 'GET' | 'POST' = 'GET',
  token?: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const response = await fetch('/api' + path, {
    method,
    cache: 'no-store',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data: unknown = await response.json();
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
      ? data.error
      : 'Сервер недоступен';
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  return data as T;
}
