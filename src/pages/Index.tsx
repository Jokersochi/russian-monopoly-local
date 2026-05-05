import { useRef, useEffect, useState } from 'react';
import { GameProvider, useGame } from '@/contexts/GameContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { PlayerPanel } from '@/components/PlayerPanel';
import { DiceRoller } from '@/components/DiceRoller';
import { ActionPanel } from '@/components/ActionPanel';
import { GameLog } from '@/components/GameLog';

const BOARD_NATURAL_WIDTH = 918; // px: 902px board + 8px border each side

const ScaledBoard = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width ?? el.offsetWidth;
      setScale(Math.min(1, w / BOARD_NATURAL_WIDTH));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="w-full flex items-start justify-center overflow-hidden">
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          width: BOARD_NATURAL_WIDTH,
          flexShrink: 0,
          marginBottom: scale < 1 ? `${-(BOARD_NATURAL_WIDTH * (1 - scale))}px` : undefined,
        }}
      >
        <GameBoard />
      </div>
    </div>
  );
};

const GameContent = () => {
  const { gameState } = useGame();

  if (!gameState) {
    return <GameSetup />;
  }

  return (
    <div className="min-h-screen p-4 overflow-auto relative">
      <div className="absolute inset-0 bg-gradient-board opacity-10 pointer-events-none"></div>
      <div className="max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6">
          {/* Left side - Game Board (scaled on small screens) */}
          <div>
            <ScaledBoard />
          </div>

          {/* Right side - Controls */}
          <div className="space-y-4">
            <PlayerPanel />
            <DiceRoller />
            <ActionPanel />
            <div className="h-64">
              <GameLog />
            </div>
          </div>
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
