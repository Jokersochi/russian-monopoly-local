import { useEffect, useRef, useState } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { LocaleProvider, useLocale } from '@/contexts/LocaleContext';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { PlayerPanel } from '@/components/PlayerPanel';
import { DiceRoller } from '@/components/DiceRoller';
import { ActionPanel } from '@/components/ActionPanel';
import { GameLog } from '@/components/GameLog';

// 902px inner board + 64px padding + 16px border.
const BOARD_NATURAL_SIZE = 982;

const ScaledBoard = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const updateScale = () => {
      const availableWidth = element.clientWidth;
      setScale(Math.min(1, availableWidth / BOARD_NATURAL_SIZE));
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="w-full overflow-hidden">
      <div
        className="relative w-full"
        style={{ height: `${BOARD_NATURAL_SIZE * scale}px` }}
      >
        <div
          className="absolute top-0 left-1/2"
          style={{
            width: BOARD_NATURAL_SIZE,
            height: BOARD_NATURAL_SIZE,
            marginLeft: -(BOARD_NATURAL_SIZE / 2),
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
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

  if (!gameState) {
    return <GameSetup />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const currentPlayerName = currentPlayer.displayName || t(`players.${currentPlayer.nameKey}`);
  const activePlayers = gameState.players.filter(player => !player.bankrupt).length;

  return (
    <div className="min-h-screen overflow-auto px-3 py-3 sm:px-5 sm:py-5 relative">
      <div
        className="fixed inset-0 pointer-events-none opacity-90"
        style={{
          background:
            'radial-gradient(circle at 15% 15%, rgba(180,120,55,0.12), transparent 30%), radial-gradient(circle at 85% 80%, rgba(17,76,53,0.16), transparent 35%)',
        }}
      />

      <div className="max-w-[1840px] mx-auto relative z-10 space-y-4">
        <header className="rounded-2xl border border-russia-gold/25 bg-card/90 backdrop-blur-xl shadow-board px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.28em] text-russia-gold/80 font-semibold">
                Premium tabletop mode
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-russian bg-clip-text text-transparent">
                {t('game.title')}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Экономическая стратегия · локальная партия · автосохранение
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 lg:min-w-[620px]">
              <div className="rounded-xl border border-border/60 bg-background/55 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ход</p>
                <p className="font-bold truncate mt-0.5">{currentPlayer.token} {currentPlayerName}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/55 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Раунд</p>
                <p className="font-bold mt-0.5">{gameState.round}/{gameState.maxRounds}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/55 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Игроки</p>
                <p className="font-bold mt-0.5">{activePlayers}/{gameState.players.length}</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/55 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Фаза</p>
                <p className="font-bold mt-0.5 capitalize truncate">{gameState.phase}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-4 xl:gap-6 items-start">
          <main className="min-w-0 rounded-2xl border border-russia-gold/15 bg-black/5 p-1 sm:p-2 shadow-board">
            <ScaledBoard />
          </main>

          <aside className="space-y-4 xl:sticky xl:top-5">
            <DiceRoller />
            <ActionPanel />
            <PlayerPanel />
            <div className="h-72 xl:h-64">
              <GameLog />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <LocaleProvider>
      <GameProvider>
        <GameContent />
      </GameProvider>
    </LocaleProvider>
  );
};

export default Index;
