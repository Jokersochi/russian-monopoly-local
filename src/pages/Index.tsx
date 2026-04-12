import { LocaleProvider } from '@/contexts/LocaleContext';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { PlayerPanel } from '@/components/PlayerPanel';
import { DiceRoller } from '@/components/DiceRoller';
import { ActionPanel } from '@/components/ActionPanel';
import { GameLog } from '@/components/GameLog';
import { useGameStore } from '@/store/useGameStore';

const GameContent = () => {
  const { gameState } = useGameStore();

  if (!gameState) {
    return <GameSetup />;
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] p-8 overflow-hidden relative">
      <div className="max-w-[1920px] mx-auto h-full relative z-10">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] gap-12 h-full">
          {/* Left side - Game Board */}
          <div className="flex items-center justify-center bg-black/40 rounded-[60px] p-12 shadow-inner border border-white/5">
            <GameBoard />
          </div>

          {/* Right side - Player Panel (Leather) */}
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <PlayerPanel />
            </div>
            <div className="space-y-4">
              <DiceRoller />
              <ActionPanel />
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
      <GameContent />
    </LocaleProvider>
  );
};

export default Index;
