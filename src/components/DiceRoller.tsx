import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

export const DiceRoller = () => {
  const { gameState, rollDice, buyProperty, passProperty, endTurn } = useGame();
  const { t } = useLocale();
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    setRolling(true);
    rollDice();
    setTimeout(() => setRolling(false), 600);
  };

  useEffect(() => {
    if (!gameState) return;
    const onKey = (e: KeyboardEvent) => {
      // Don't fire when typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const phase = gameState.phase;
      if (e.code === 'Space' && (phase === 'rolling' || phase === 'jail')) {
        e.preventDefault();
        handleRoll();
      } else if (e.key === 'b' || e.key === 'B') {
        if (phase === 'landed') buyProperty();
      } else if (e.key === 'p' || e.key === 'P') {
        if (phase === 'landed') passProperty();
      } else if (e.key === 'Enter') {
        if (phase === 'landed' || phase === 'paying-rent' || phase === 'card-draw') endTurn();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gameState, rollDice, buyProperty, passProperty, endTurn]);

  if (!gameState) return null;

  const canRoll = gameState.phase === 'rolling' || gameState.phase === 'jail';

  return (
    <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-red/20">
      <div className="p-4 border-b border-russia-red/20">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-russia-red">🎲</span>
          {t('game.rollDice')}
        </h3>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex gap-4 justify-center">
          {gameState.lastRoll ? (
            <>
              <DiceFace value={gameState.lastRoll[0]} rolling={rolling} />
              <DiceFace value={gameState.lastRoll[1]} rolling={rolling} />
            </>
          ) : (
            <>
              <DiceFace value={1} rolling={false} />
              <DiceFace value={1} rolling={false} />
            </>
          )}
        </div>

        {gameState.lastRoll && (
          <div className="text-center p-3 bg-russia-gold/10 rounded-lg border-2 border-russia-gold/30 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Сумма: <span className="font-bold text-3xl text-russia-gold ml-2">{gameState.lastRoll[0] + gameState.lastRoll[1]}</span>
            </p>
            {gameState.lastRoll[0] === gameState.lastRoll[1] && (
              <p className="text-xs text-russia-red font-bold mt-1">🎯 Дубль!</p>
            )}
          </div>
        )}

        <Button
          onClick={handleRoll}
          disabled={!canRoll || rolling}
          size="lg"
          className={cn(
            'w-full h-14 text-lg font-bold bg-gradient-russian hover:opacity-90 shadow-strong transition-all hover:scale-105',
            rolling && 'pointer-events-none animate-pulse'
          )}
        >
          {rolling ? '🎲 Бросаем...' : `🎲 ${t('game.rollDice')}`}
        </Button>
      </div>
    </Card>
  );
};

const DiceFace = ({ value, rolling }: { value: number; rolling: boolean }) => {
  const dots = Array.from({ length: value }, (_, i) => i);

  return (
    <div
      className={cn(
        'w-20 h-20 bg-russia-white border-4 border-foreground rounded-xl shadow-lg flex items-center justify-center transition-transform',
        rolling && 'dice-rolling'
      )}
    >
      <div className="grid grid-cols-3 gap-1 w-full h-full p-2">
        {[...Array(9)].map((_, idx) => {
          const showDot = getDotPattern(value)[idx];
          return (
            <div
              key={idx}
              className={cn(
                'rounded-full transition-all',
                showDot ? 'bg-foreground' : 'bg-transparent'
              )}
            />
          );
        })}
      </div>
    </div>
  );
};

const getDotPattern = (value: number): boolean[] => {
  const patterns: Record<number, boolean[]> = {
    1: [false, false, false, false, true, false, false, false, false],
    2: [true, false, false, false, false, false, false, false, true],
    3: [true, false, false, false, true, false, false, false, true],
    4: [true, false, true, false, false, false, true, false, true],
    5: [true, false, true, false, true, false, true, false, true],
    6: [true, false, true, true, false, true, true, false, true],
  };
  return patterns[value] || patterns[1];
};
