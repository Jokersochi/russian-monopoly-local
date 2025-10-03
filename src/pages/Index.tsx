import { GameProvider, useGame } from '@/contexts/GameContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { GameSetup } from '@/components/GameSetup';
import { GameBoard } from '@/components/GameBoard';
import { PlayerPanel } from '@/components/PlayerPanel';
import { DiceRoller } from '@/components/DiceRoller';
import { ActionPanel } from '@/components/ActionPanel';
import { GameLog } from '@/components/GameLog';

const GameContent = () => {
  const { gameState } = useGame();

  if (!gameState) {
    return <GameSetup />;
  }

  return (
    <div className="min-h-screen bg-background p-4 overflow-auto">
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-4">
          {/* Left side - Game Board */}
          <div className="flex items-center justify-center">
            <GameBoard />
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
