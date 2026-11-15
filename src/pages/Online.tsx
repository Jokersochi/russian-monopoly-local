import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, Wifi, WifiOff, Dices, LockKeyhole, Send, Users, Coins } from 'lucide-react';
import { BOARD_CELLS } from '@/data/board';
import { BOARD_POSITIONS } from '@/lib/boardGeometry';
import type { OnlineRoomState, OnlineAction } from '@/lib/onlineEngine';
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext';

type StoredSession = { roomId: string; playerId: string; token: string };
type ChatMessage = { id: string; name: string; text: string; at: number };
const SESSION_KEY = 'ml_online_session_v1';
const url = import.meta.env.VITE_ONLINE_WS_URL ||
  (import.meta.env.DEV ? 'ws://127.0.0.1:8789/ws' : '');

function readSession(): StoredSession | null {
  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return value && typeof value.roomId === 'string' && typeof value.token === 'string' ? value : null;
  } catch { return null; }
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value / 1_000_000) + ' млн ₽';
}

function OnlinePage() {
  const { t } = useLocale();
  const socket = useRef<WebSocket | null>(null);
  const sendFn = useRef<(payload: object) => void>(() => {});
  const [connected, setConnected] = useState(false);
  const [session, setSession] = useState<StoredSession | null>(readSession);
  const [state, setState] = useState<OnlineRoomState | null>(null);
  const [name, setName] = useState('Игрок');
  const [roomCode, setRoomCode] = useState('');
  const [status, setStatus] = useState('Подключение к серверу...');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const retry = useRef(0);

  useEffect(() => {
    if (!url) { setStatus('Онлайн-сервер не настроен: укажите VITE_ONLINE_WS_URL'); return; }
    let disposed = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let current: WebSocket | undefined;

    const connect = () => {
      if (disposed) return;
      current = new WebSocket(url);
      socket.current = current;
      current.onopen = () => {
        setConnected(true);
        setStatus('Соединение установлено');
        retry.current = 0;
        const saved = readSession();
        if (saved) current?.send(JSON.stringify({ type: 'resume', roomId: saved.roomId, token: saved.token }));
      };
      current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as Record<string, unknown>;
          if (msg.type === 'session') {
            const next = { roomId: String(msg.roomId), playerId: String(msg.playerId), token: String(msg.token) };
            localStorage.setItem(SESSION_KEY, JSON.stringify(next));
            setSession(next);
            setRoomCode(next.roomId);
          }
          if (msg.type === 'state') setState(msg.state as OnlineRoomState);
          if (msg.type === 'chatHistory') setMessages(msg.messages as ChatMessage[]);
          if (msg.type === 'chat') setMessages((prev) => [...prev.slice(-100), msg.message as ChatMessage]);
          if (msg.type === 'error') setStatus(String(msg.message || 'Ошибка сервера'));
        } catch { setStatus('Ошибка обработки пакета'); }
      };
      current.onclose = (event) => {
        setConnected(false);
        if (disposed) return;
        setStatus(event.code === 4001 ? 'Сессия открыта на другом устройстве' : 'Связь потеряна, переподключение…');
        if (event.code === 4001) return;
        timeout = setTimeout(connect, Math.min(1000 * 2 ** retry.current++, 10000));
      };
      current.onerror = () => setStatus('Не удалось подключиться к онлайн-серверу');
    };
    sendFn.current = (payload: object) => {
      if (socket.current?.readyState !== WebSocket.OPEN) {
        setStatus('Нет соединения с сервером');
        return;
      }
      socket.current.send(JSON.stringify(payload));
    };
    connect();
    return () => {
      disposed = true;
      if (timeout) clearTimeout(timeout);
      current?.close();
      sendFn.current = () => {};
    };
  }, []);

  const send = (payload: object) => sendFn.current(payload);
  const act = (action: OnlineAction) => send({ type: 'action', action, requestId: crypto.randomUUID() });
  const me = state?.players.find((p) => p.id === session?.playerId);
  const current = state?.players.find((p) => p.id === state.currentPlayerId);
  const myTurn = Boolean(me && state?.currentPlayerId === me.id);
  const readyToStart = Boolean(state && me && state.phase === 'lobby' &&
    me.id === state.hostId && state.players.length >= 2 &&
    state.players.every((p) => p.ready));
  const pendingCell = state?.pendingProperty === null || state?.pendingProperty === undefined
    ? null : BOARD_CELLS[state.pendingProperty];
  const ownerMap = useMemo(() => {
    const owners = new Map<number, string>();
    state?.players.forEach((player) => player.properties.forEach((id) => owners.set(id, player.id)));
    return owners;
  }, [state]);

  const sendChat = () => {
    const text = draft.trim();
    if (!text || text.length > 250) return;
    send({ type: 'chat', text });
    setDraft('');
  };

  return (
    <div className="min-h-screen bg-[#090e16] text-[#f1e5cd] px-3 py-5 lg:px-8">
      <header className="max-w-[1750px] mx-auto flex flex-wrap justify-between items-center gap-4 pb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-3 rounded-xl border border-amber-300/25 hover:bg-white/10" aria-label="Вернуться в локальную игру">
            <ArrowLeft size={19} />
          </Link>
          <Crown className="text-amber-300" size={32} />
          <div><div className="text-xs tracking-[0.3em] text-amber-200/60">RUSSIAN EMPIRE</div>
            <h1 className="text-2xl font-black">MONOPOLY LUXE <span className="text-amber-400">ONLINE ALPHA</span></h1>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs rounded-full bg-white/5 px-4 py-2 border border-white/10">
          {connected ? <Wifi size={16} className="text-emerald-400" /> : <WifiOff size={16} className="text-red-400" />}
          {connected ? 'Сервер подключен' : 'Нет связи'}
        </div>
      </header>

      <div className="max-w-[1750px] mx-auto">
        <p className="mb-4 text-sm text-amber-100/65" role="status" aria-live="polite">{status}</p>
        {!state && (
          <section className="max-w-xl mx-auto rounded-3xl border border-amber-300/25 bg-[#17212b] p-7 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Начать онлайн-партию</h2>
            <p className="text-sm text-[#b5ad9c] mb-5">Комната на 2–6 игроков. Авторитетные ходы и расчёты на сервере.</p>
            <label className="block text-sm mb-2" htmlFor="onlineName">Ваше имя</label>
            <input id="onlineName" className="mb-4 w-full rounded-xl border border-white/15 bg-[#0b111a] px-4 py-3"
              value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
            <button disabled={!connected || name.trim().length < 2}
              onClick={() => send({ type: 'create', name: name.trim() })}
              className="w-full rounded-xl p-3 font-bold bg-gradient-to-r from-[#ddb15b] to-[#f2d392] text-[#2b1a0e] disabled:opacity-40">
              Создать комнату
            </button>
            <div className="my-4 flex gap-3 items-center text-sm text-[#988c75]"><div className="h-px bg-white/15 flex-1" />или присоединиться<div className="h-px bg-white/15 flex-1" /></div>
            <div className="flex gap-2">
              <input aria-label="Код комнаты" placeholder="Код (6 символов)" value={roomCode} maxLength={6}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-[#0b111a] px-4 py-3 uppercase tracking-widest" />
              <button disabled={!connected || roomCode.length !== 6}
                onClick={() => send({ type: 'join', roomId: roomCode, name: name.trim() })}
                className="rounded-xl border border-amber-300/35 px-5 font-semibold disabled:opacity-40">Войти</button>
            </div>
            {session && <p className="text-xs text-amber-100/60 mt-4">Сохранена сессия комнаты {session.roomId}. Если восстановление не удалось, можно начать новую игру.</p>}
          </section>
        )}

        {state && (
          <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_340px] gap-5">
            <main className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-[#3e291c] via-[#241b18] to-[#442b1d] p-3 lg:p-5 overflow-auto">
              <div className="flex flex-wrap justify-between gap-3 mb-3">
                <strong className="tracking-wide text-amber-200">Комната: {state.roomId}</strong>
                <span className="text-sm text-[#cabb9f]">Раунд {state.round} · Версия состояния {state.version}</span>
              </div>
              <div className="min-w-[1050px] aspect-[14/8] grid gap-[2px] rounded-xl border-4 border-[#a57b42] overflow-hidden bg-[#0e1920]"
                style={{ gridTemplateColumns: 'repeat(14,minmax(0,1fr))', gridTemplateRows: 'repeat(8,minmax(0,1fr))' }}>
                {BOARD_CELLS.map((cell) => {
                  const grid = BOARD_POSITIONS[cell.id];
                  const occupants = state.players.filter((p) => p.position === cell.id && !p.bankrupt);
                  const owner = ownerMap.get(cell.id);
                  return (
                    <div key={cell.id} style={{ gridColumn: grid.col + 1, gridRow: grid.row + 1 }}
                      className={'relative rounded-[2px] border border-[#ad9064] p-1 flex flex-col justify-between text-[#352513] text-center ' +
                        (current?.position === cell.id ? 'bg-[#ffe4a0] ring-2 ring-amber-500 z-10' : 'bg-[#e4d0aa]')}>
                      {cell.color && <div className="absolute top-0 left-0 right-0 h-[5px]" style={{ background: cell.color }} />}
                      <small className="text-[8px] self-start text-[#8b6b42]">{cell.id}</small>
                      <span className="text-[10px] font-black leading-tight">{t('cells.' + cell.nameKey)}</span>
                      <span className="text-[10px] font-bold">{cell.price ? (cell.price / 1e6).toFixed(1) + 'M' : '◆'}</span>
                      {owner && <span className="absolute top-1 right-1 text-[8px]">●</span>}
                      {occupants.length > 0 && (
                        <div className="absolute bottom-[15px] left-1 flex flex-wrap gap-[1px]">
                          {occupants.map((p) => <span key={p.id} title={p.name} className="text-sm">{p.token}</span>)}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="col-[2_/_span_12] row-[2_/_span_6] rounded-2xl border-2 border-amber-300/35 bg-[radial-gradient(circle_at_center,#263434,#0a151d_75%)] grid place-items-center">
                  <div className="text-center px-6">
                    <div className="text-xs tracking-[0.45em] text-[#e2ba74]">GOLD ONLINE EDITION</div>
                    <Crown className="text-[#cda566] mx-auto my-3" size={46} />
                    <div className="font-serif text-5xl lg:text-7xl font-black tracking-wide text-[#f0d295]">МОНОПОЛИЯ</div>
                    <div className="my-3 h-px bg-gradient-to-r from-transparent via-[#cfa55f] to-transparent" />
                    <AnimatePresence mode="wait">
                      <motion.div key={current?.id || 'waiting'} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-xl font-bold">
                        {current ? current.token + ' ' + current.name + ' — ходит' : 'Ожидание игроков'}
                      </motion.div>
                    </AnimatePresence>
                    <div className="mt-4 text-sm text-[#b8ac99]">{state.phase.toUpperCase()} · Игроков {state.players.length}/6</div>
                  </div>
                </div>
              </div>
            </main>

            <aside className="space-y-4">
              <section className="rounded-2xl border border-amber-300/20 bg-[#18212a] p-5">
                <h2 className="flex items-center gap-2 font-bold text-xl mb-4"><Dices className="text-amber-300" /> Управление</h2>
                {state.phase === 'lobby' ? (
                  <div className="space-y-3">
                    <div className="text-xs text-[#aaa18e]">Поделитесь кодом: <strong className="text-amber-200 tracking-widest">{state.roomId}</strong></div>
                    <button className="w-full py-3 rounded-xl bg-[#283742] font-bold"
                      onClick={() => act({ type: 'ready', ready: !me?.ready })} disabled={!me || !connected}>
                      {me?.ready ? 'Отменить готовность' : 'Я готов'}
                    </button>
                    <button onClick={() => act({ type: 'start' })} disabled={!connected || !readyToStart}
                      className="w-full py-3 rounded-xl bg-amber-300 text-[#2b1e16] font-black disabled:opacity-30">
                      Начать матч
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {state.dice && <div className="rounded-xl bg-black/25 text-center py-3 text-2xl font-black">{state.dice.join(' + ')} = {state.dice[0] + state.dice[1]}</div>}
                    {state.phase === 'finished' && <p className="text-amber-300 font-bold">Победитель: {state.players.find((p) => p.id === state.winnerId)?.name ?? '—'}</p>}
                    <button disabled={!myTurn || !connected || state.phase !== 'rolling'} onClick={() => act({ type: 'roll' })}
                      className="w-full rounded-xl py-3 bg-gradient-to-r from-amber-400 to-amber-200 font-black text-[#301e12] disabled:opacity-30">Бросить кубики</button>
                    {pendingCell && myTurn && state.phase === 'buy' && (
                      <div className="rounded-xl bg-black/20 p-3">
                        <div className="text-sm font-bold mb-2">{t('cells.' + pendingCell.nameKey)}</div>
                        <div className="text-sm mb-2">{formatMoney(pendingCell.price || 0)}</div>
                        <button disabled={!me || me.money < (pendingCell.price || 0)} onClick={() => act({ type: 'buy' })}
                          className="w-full py-2 bg-emerald-600 rounded-lg font-bold disabled:opacity-30 mb-2">Купить</button>
                        <button onClick={() => act({ type: 'pass' })} className="w-full py-2 bg-[#283742] rounded-lg">Пропустить</button>
                      </div>
                    )}
                    {myTurn && me && me.jailTurns > 0 && state.phase === 'rolling' && (
                      <button onClick={() => act({ type: 'bail' })} className="w-full py-3 rounded-xl border border-amber-200/30">
                        <LockKeyhole size={16} className="inline" /> Оплатить залог · 500K
                      </button>
                    )}
                    <button onClick={() => act({ type: 'end' })} disabled={!connected || !myTurn || state.phase !== 'end'}
                      className="w-full py-3 rounded-xl border border-amber-300/30 disabled:opacity-30">Завершить ход</button>
                  </div>
                )}
              </section>
              <section className="rounded-2xl border border-amber-300/20 bg-[#18212a] p-5">
                <h2 className="flex items-center gap-2 font-bold text-lg mb-3"><Users size={19} className="text-amber-300" /> Игроки</h2>
                <div className="space-y-2">
                  {state.players.map((player) => (
                    <div key={player.id} className={'rounded-xl p-3 border ' + (player.id === current?.id ? 'border-amber-300/50 bg-amber-300/10' : 'border-white/10 bg-black/10')}>
                      <div className="flex items-center justify-between gap-1"><strong>{player.token} {player.name}</strong>
                        <small className={player.connected ? 'text-emerald-400' : 'text-red-300'}>{player.connected ? '●' : '○'} {player.ready ? 'Готов' : ''}</small>
                      </div>
                      <p className="text-xs text-[#c0b6a1] mt-1"><Coins size={12} className="inline" /> {formatMoney(player.money)} · {player.properties.length} активов</p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="rounded-2xl border border-amber-300/20 bg-[#18212a] p-5">
                <h2 className="font-bold text-lg mb-3">Чат комнаты</h2>
                <div className="max-h-40 min-h-24 overflow-y-auto space-y-2 mb-3" aria-live="polite">
                  {messages.map((msg) => <p key={msg.id} className="text-sm"><strong className="text-amber-300">{msg.name}:</strong> {msg.text}</p>)}
                </div>
                <div className="flex gap-2">
                  <input aria-label="Сообщение" value={draft} maxLength={250} onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
                    className="min-w-0 flex-1 rounded-xl border border-white/20 bg-[#0a1118] p-2" />
                  <button onClick={sendChat} disabled={!connected || !draft.trim()} aria-label="Отправить" className="px-3 rounded-xl bg-amber-300 text-black disabled:opacity-30"><Send size={18} /></button>
                </div>
              </section>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OnlineRoute() {
  return <LocaleProvider><OnlinePage /></LocaleProvider>;
}
