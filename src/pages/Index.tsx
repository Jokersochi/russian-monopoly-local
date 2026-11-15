import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Expand, Gem, Minimize2, ShieldCheck, Sparkles } from 'lucide-react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { PlayerPanel } from '@/components/PlayerPanel';
import { DiceRoller } from '@/components/DiceRoller';
import { ActionPanel } from '@/components/ActionPanel';
import { GameLog } from '@/components/GameLog';
import { BOARD_HEIGHT, BOARD_WIDTH } from '@/lib/boardGeometry';

const ScaledBoard = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const updateScale = () => {
      setScale(Math.min(1, Math.max(0.60, element.clientWidth / BOARD_WIDTH)));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="w-full overflow-x-auto overscroll-x-contain">
      <div className="relative mx-auto" style={{ width: BOARD_WIDTH * scale, height: BOARD_HEIGHT * scale }}>
        <div
          className="absolute top-0 left-0"
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            transform: 'scale(' + scale + ')',
            transformOrigin: 'top left',
          }}
        >
          <GameBoard />
        </div>
      </div>
    </div>
  );
};

const GameContent = () => {
  const { gameState } = useGame();
  const { t } = useLocale();
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.add('dark');
    return () => { if (!wasDark) root.classList.remove('dark'); };
  }, []);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  if (!gameState) {
    return <div className="dark min-h-screen bg-[#0a1018] text-foreground"><GameSetup /></div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const activePlayers = gameState.players.filter(player => !player.bankrupt).length;
  const currentPlayerName = currentPlayer.displayName || t('players.' + currentPlayer.nameKey);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Browsers may deny fullscreen outside a permitted context.
    }
  };

  return (
    <div className="dark min-h-screen overflow-auto bg-[#090f17] text-foreground relative px-3 py-4 sm:px-5 lg:px-7 lg:py-6">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 0%, rgba(155,104,48,0.17), transparent 35%), radial-gradient(ellipse at 90% 90%, rgba(19,79,81,0.18), transparent 35%)',
        }}
      />
      <div className="relative z-10 max-w-[2100px] mx-auto space-y-5">
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[24px] border border-amber-400/25 bg-[#151c25]/95 shadow-[0_18px_60px_rgba(0,0,0,0.35)] px-5 py-4"
        >
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-[#d8a957] to-[#755024] grid place-items-center shadow-[0_0_25px_rgba(240,179,81,0.17)]">
                <Crown className="text-[#21150f]" size={30} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-amber-200/65">
                  <Gem size={12} /> Russian Empire / Gold Edition
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-[0.09em] text-[#f7ddac]">
                  {t('game.title')}
                </h1>
                <p className="text-xs text-[#b1a690] mt-1">
                  Премиальная экономическая стратегия · локальная игра · автосохранение
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-[#cda66a]/20 bg-[#0b111a] px-4 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#9d9383]">Ход игрока</div>
                <div className="font-bold text-[#f5d6a1]">{currentPlayer.token} {currentPlayerName}</div>
              </div>
              <div className="rounded-xl border border-[#cda66a]/20 bg-[#0b111a] px-4 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#9d9383]">Раунд</div>
                <div className="font-bold">{gameState.round} / {gameState.maxRounds}</div>
              </div>
              <div className="rounded-xl border border-[#cda66a]/20 bg-[#0b111a] px-4 py-2">
                <div className="text-[10px] uppercase tracking-wider text-[#9d9383]">Игроки</div>
                <div className="font-bold">{activePlayers} / {gameState.players.length}</div>
              </div>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 px-4 py-3 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20 transition-colors font-semibold text-sm"
              >
                {fullscreen ? <Minimize2 size={17} /> : <Expand size={17} />}
                {fullscreen ? 'Свернуть' : 'Во весь экран'}
              </button>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_350px] gap-5 items-start">
          <motion.main
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="min-w-0 rounded-[26px] border border-[#d0a560]/20 bg-[#121821]/65 p-2 sm:p-3 shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-2 mb-2">
              <span className="text-xs uppercase tracking-[0.25em] font-bold text-[#d7b67f] inline-flex items-center gap-2">
                <Sparkles size={15} /> Игровое поле · 40 активов и событий
              </span>
              <span className="text-[11px] text-[#aaa18d]">14 × 8 · 40 клеток по периметру</span>
            </div>
            <ScaledBoard />
            <div className="text-[11px] text-[#8b938f] px-3 py-3 flex gap-2 items-center">
              <ShieldCheck size={14} />
              Расчёты выполняются существующим игровым движком. Нажмите на недвижимость для просмотра карточки.
            </div>
          </motion.main>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="luxury-control-panel space-y-4 min-w-0 2xl:sticky 2xl:top-5"
          >
            <DiceRoller />
            <ActionPanel />
            <PlayerPanel />
            <div className="h-72"><GameLog /></div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};

const Index = () => (
  <LocaleProvider>
    <GameProvider>
      <GameContent />
    </GameProvider>
  </LocaleProvider>
);

export default Index;
