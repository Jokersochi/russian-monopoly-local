import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BOARD_CELLS } from '@/data/board';
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext';
import {
  clearRoomToken, getRoomToken, onlineRequest, saveRoomToken,
  type OnlineGame, type OnlineSession, type OnlineSnapshot,
} from '@/lib/online';

const formatMoney = (value: number) => value.toLocaleString('ru-RU') + ' ₽';

function OnlineBoard({ game }: { game: OnlineGame }) {
  const { t } = useLocale();
  return (
    <div className="overflow-x-auto rounded-2xl border-8 border-amber-950/80 bg-[#55351f] p-2 shadow-2xl">
      <div className="relative grid aspect-square min-w-[700px] grid-cols-11 grid-rows-11 gap-0.5 bg-[#f4e8ce] p-1">
        {BOARD_CELLS.map((cell) => {
          const owner = game.players.find((player) => player.properties.includes(cell.id));
          const occupants = game.players.filter((player) => !player.bankrupt && player.position === cell.id);
          return (
            <div
              key={cell.id}
              className="min-w-0 overflow-hidden rounded border border-amber-950/35 bg-[#fffaf0] p-1 text-center text-[#342318]"
              style={{
                gridColumnStart: cell.position.x + 1,
                gridRowStart: cell.position.y + 1,
                borderTop: '5px solid ' + (cell.color ?? '#a18a65'),
              }}
              title={t('cells.' + cell.nameKey) + (cell.price ? ' · ' + formatMoney(cell.price) : '')}
            >
              <div className="text-[9px] font-bold leading-tight">{t('cells.' + cell.nameKey)}</div>
              {cell.price && <div className="mt-1 text-[9px]">{(cell.price / 1_000_000).toFixed(1)}M</div>}
              {owner && <div className="text-[9px] font-semibold text-emerald-800">● {owner.name}</div>}
              <div className="mt-1 flex flex-wrap justify-center gap-0.5">
                {occupants.map((player) => (
                  <span key={player.id} title={player.name} className="text-sm">{player.token}</span>
                ))}
              </div>
            </div>
          );
        })}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-amber-900/20 bg-[radial-gradient(ellipse_at_center,#fef8e8,#d8c6a2)] p-8 text-center text-amber-950">
          <p className="text-xs font-bold uppercase tracking-[0.35em]">Russian Empire Online</p>
          <h2 className="text-5xl font-black tracking-tight">МОНОПОЛИЯ</h2>
          <p className="text-lg">Серверная партия · Раунд {game.round}/{game.maxRounds}</p>
          <div className="rounded-xl border border-amber-900/20 bg-white/50 px-8 py-4">
            <p className="text-sm uppercase tracking-widest">Текущий ход</p>
            <p className="mt-1 text-2xl font-bold">
              {game.players[game.currentPlayer]?.token} {game.players[game.currentPlayer]?.name}
            </p>
            {game.dice && <p className="mt-2 text-xl">🎲 {game.dice[0]} + {game.dice[1]}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function OnlineContent() {
  const initialRoom = new URLSearchParams(window.location.search).get('room')?.toUpperCase() ?? '';
  const [roomInput, setRoomInput] = useState(initialRoom);
  const [activeRoom, setActiveRoom] = useState(initialRoom);
  const [token, setToken] = useState<string | null>(() => initialRoom ? getRoomToken(initialRoom) : null);
  const [name, setName] = useState('');
  const [snapshot, setSnapshot] = useState<OnlineSnapshot | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    if (!token || !activeRoom) return;
    let active = true;
    const refresh = async () => {
      try {
        const data = await onlineRequest<OnlineSnapshot>('/rooms/' + activeRoom, 'GET', token);
        if (active) {
          setSnapshot((previous) => !previous || data.version >= previous.version ? data : previous);
          setError('');
        }
      } catch (failure) {
        if (!active) return;
        const apiError = failure as Error & { status?: number };
        if (apiError.status === 401 || apiError.status === 404) {
          clearRoomToken(activeRoom);
          setToken(null);
          setSnapshot(null);
        }
        setError(apiError.message || 'Нет связи с сервером');
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 1500);
    return () => { active = false; window.clearInterval(timer); };
  }, [activeRoom, token]);

  const activate = (result: OnlineSession) => {
    saveRoomToken(result.room.roomId, result.sessionId);
    setActiveRoom(result.room.roomId);
    setRoomInput(result.room.roomId);
    setToken(result.sessionId);
    setSnapshot(result.room);
    setError('');
    window.history.replaceState(null, '', '/online?room=' + result.room.roomId);
  };

  const createRoom = async () => {
    setBusy(true);
    setError('');
    try {
      activate(await onlineRequest<OnlineSession>('/rooms', 'POST', undefined, { name }));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Не удалось создать комнату');
    } finally { setBusy(false); }
  };

  const joinRoom = async () => {
    const id = roomInput.trim().toUpperCase();
    if (!/^[A-F0-9]{10}$/.test(id)) { setError('Введите код комнаты из 10 символов'); return; }
    setBusy(true);
    setError('');
    try {
      const savedToken = getRoomToken(id);
      if (savedToken) {
        const room = await onlineRequest<OnlineSnapshot>('/rooms/' + id, 'GET', savedToken);
        activate({ sessionId: savedToken, room });
      } else {
        activate(await onlineRequest<OnlineSession>('/rooms/' + id + '/join', 'POST', undefined, { name }));
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Не удалось войти');
    } finally { setBusy(false); }
  };

  const send = async (path: string, body: Record<string, unknown>) => {
    if (!snapshot || !token || busy) return;
    setBusy(true);
    setError('');
    try {
      const data = await onlineRequest<OnlineSnapshot>('/rooms/' + snapshot.roomId + path, 'POST', token, body);
      setSnapshot((previous) => !previous || data.version >= previous.version ? data : previous);
      if (path === '/chat') setMessage('');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Ошибка действия');
    } finally { setBusy(false); }
  };

  const sendChat = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (message.trim()) void send('/chat', { text: message });
  };

  const game = snapshot?.game;
  const current = game?.players[game.currentPlayer];
  const myTurn = !!current && current.id === snapshot?.youId && !current.bankrupt;
  const currentCell = current ? BOARD_CELLS[current.position] : null;
  const inviteUrl = snapshot ? window.location.origin + '/online?room=' + snapshot.roomId : '';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#34483c,#131a1b_65%)] px-3 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-[1660px] space-y-5">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-black/35 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-300">Premium multiplayer · Beta</p>
            <h1 className="text-3xl font-black">🎲 Русская Монополия Online</h1>
            <p className="mt-1 text-sm text-white/60">Комнаты · Серверные ходы · Переподключение · Чат</p>
          </div>
          <Link to="/" className="rounded-lg border border-amber-400/40 px-4 py-2 text-sm hover:bg-white/10">
            ← Локальная игра
          </Link>
        </header>

        {error && <div role="alert" className="rounded-xl border border-red-400/50 bg-red-950/60 p-3 text-sm">{error}</div>}

        {!snapshot ? (
          <section className="mx-auto max-w-xl space-y-4 rounded-2xl border border-amber-400/25 bg-black/45 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold">Играть с друзьями</h2>
            <p className="text-sm text-white/65">Создайте комнату или введите код приглашения. Для работы нужен запущенный Online API.</p>
            <label className="block text-sm">Ваше имя
              <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 p-3" maxLength={20}
                value={name} onChange={(event) => setName(event.target.value)} placeholder="Имя игрока" />
            </label>
            <button disabled={busy || name.trim().length < 2} onClick={() => void createRoom()}
              className="w-full rounded-xl bg-amber-500 px-5 py-3 font-bold text-black disabled:opacity-40">Создать комнату</button>
            <div className="border-t border-white/20 pt-4">
              <label className="block text-sm">Код комнаты
                <input className="mt-1 w-full rounded-lg border border-white/20 bg-black/40 p-3 font-mono uppercase"
                  maxLength={10} value={roomInput} onChange={(event) => setRoomInput(event.target.value)} placeholder="A1B2C3D4E5" />
              </label>
              <button disabled={busy || (!getRoomToken(roomInput.trim().toUpperCase()) && name.trim().length < 2)}
                onClick={() => void joinRoom()}
                className="mt-3 w-full rounded-xl border border-amber-400 px-5 py-3 font-bold hover:bg-white/10 disabled:opacity-40">Войти / восстановить сессию</button>
            </div>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-black/40 p-4">
              <div>
                <p className="text-xs uppercase text-amber-300">Комната</p>
                <p className="font-mono text-2xl font-bold tracking-widest">{snapshot.roomId}</p>
              </div>
              <div className="min-w-0 flex-1 sm:text-right">
                <p className="text-xs text-white/60">Ссылка для приглашения</p>
                <input aria-label="Ссылка на комнату" readOnly value={inviteUrl}
                  onFocus={(event) => event.currentTarget.select()}
                  className="mt-1 w-full max-w-lg rounded-lg border border-white/20 bg-black/40 p-2 text-sm sm:ml-auto" />
              </div>
            </div>

            {snapshot.status === 'lobby' ? (
              <div className="mx-auto max-w-2xl rounded-2xl border border-amber-400/25 bg-black/40 p-6">
                <h2 className="text-2xl font-bold">Ожидание игроков ({snapshot.players.length}/6)</h2>
                <div className="mt-4 space-y-2">
                  {snapshot.players.map((player) => (
                    <div key={player.id} className="flex justify-between rounded-lg border border-white/15 p-3">
                      <span>{player.name} {player.id === snapshot.hostId ? '👑' : ''}</span>
                      <span className={player.connected ? 'text-emerald-300' : 'text-white/40'}>
                        {player.connected ? 'В сети' : 'Не в сети'}
                      </span>
                    </div>
                  ))}
                </div>
                {snapshot.youId === snapshot.hostId && (
                  <button disabled={busy || snapshot.players.length < 2} onClick={() => void send('/start', { maxRounds: 30 })}
                    className="mt-5 w-full rounded-xl bg-amber-500 p-4 font-bold text-black disabled:opacity-40">
                    Начать партию
                  </button>
                )}
                <p className="mt-4 text-sm text-white/60">Минимум 2 игрока. При обновлении страницы ваша сессия восстановится автоматически.</p>
              </div>
            ) : game && (
              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <OnlineBoard game={game} />
                <aside className="space-y-4">
                  <section className="rounded-xl border border-amber-400/25 bg-black/50 p-4">
                    <h2 className="text-xl font-bold">Ход {game.round} · {current?.name}</h2>
                    <p className="mt-2 text-sm text-amber-200">{game.lastEvent.startsWith('chance') || game.lastEvent.startsWith('trial')
                      ? t('cards.' + game.lastEvent) : game.lastEvent}</p>
                    {game.phase === 'game-over' ? (
                      <p className="mt-4 text-xl font-bold text-amber-300">🏆 Победитель: {game.players.find((player) => player.id === game.winnerId)?.name ?? '—'}</p>
                    ) : (
                      <>
                        <p className="mt-3 text-sm text-white/60">{myTurn ? 'Ваш ход' : 'Ожидайте ход соперника'} · {game.phase}</p>
                        <div className="mt-4 grid gap-2">
                          {game.phase === 'rolling' && (
                            <>
                              <button disabled={!myTurn || busy} onClick={() => void send('/actions', { type: 'roll', version: snapshot.version })}
                                className="rounded-lg bg-amber-500 p-3 font-bold text-black disabled:opacity-40">🎲 Бросить кубики</button>
                              {current?.inJail && <button disabled={!myTurn || busy || current.money < 500_000}
                                onClick={() => void send('/actions', { type: 'pay-bail', version: snapshot.version })}
                                className="rounded-lg border border-white/30 p-3 disabled:opacity-40">Оплатить залог 500 000 ₽</button>}
                            </>
                          )}
                          {game.phase === 'buying' && (
                            <>
                              <p className="text-sm">Объект: {currentCell && t('cells.' + currentCell.nameKey)} · {formatMoney(currentCell?.price ?? 0)}</p>
                              <button disabled={!myTurn || busy} onClick={() => void send('/actions', { type: 'buy', version: snapshot.version })}
                                className="rounded-lg bg-emerald-500 p-3 font-bold text-black disabled:opacity-40">Купить объект</button>
                              <button disabled={!myTurn || busy} onClick={() => void send('/actions', { type: 'pass', version: snapshot.version })}
                                className="rounded-lg border border-white/30 p-3 disabled:opacity-40">Пропустить покупку</button>
                            </>
                          )}
                          {game.phase === 'turn-end' && (
                            <button disabled={!myTurn || busy} onClick={() => void send('/actions', { type: 'end-turn', version: snapshot.version })}
                              className="rounded-lg bg-amber-500 p-3 font-bold text-black disabled:opacity-40">Завершить ход</button>
                          )}
                        </div>
                      </>
                    )}
                  </section>
                  <section className="rounded-xl border border-white/15 bg-black/45 p-4">
                    <h2 className="font-bold">Игроки</h2>
                    {game.players.map((player) => (
                      <div key={player.id} className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-white/10 p-2 text-sm">
                        <span className={player.bankrupt ? 'line-through opacity-40' : ''}>{player.token} {player.name}</span>
                        <span className="font-semibold text-amber-300">{formatMoney(player.money)}</span>
                      </div>
                    ))}
                  </section>
                </aside>
              </div>
            )}

            <section className="max-w-3xl rounded-xl border border-white/15 bg-black/45 p-4">
              <h2 className="font-bold">Чат комнаты</h2>
              <div aria-live="polite" className="my-3 max-h-52 space-y-2 overflow-y-auto text-sm">
                {snapshot.messages.length === 0 && <p className="text-white/50">Сообщений пока нет.</p>}
                {snapshot.messages.map((entry) => (
                  <p key={entry.id}><span className="font-bold text-amber-300">{entry.name}:</span> {entry.text}</p>
                ))}
              </div>
              <form onSubmit={sendChat} className="flex gap-2">
                <input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={280}
                  aria-label="Сообщение в чат" placeholder="Сообщение" className="min-w-0 flex-1 rounded-lg border border-white/20 bg-black/40 p-3" />
                <button disabled={busy || !message.trim()} type="submit"
                  className="rounded-lg bg-amber-500 px-4 font-bold text-black disabled:opacity-40">Отправить</button>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

export default function Online() {
  return <LocaleProvider><OnlineContent /></LocaleProvider>;
}
