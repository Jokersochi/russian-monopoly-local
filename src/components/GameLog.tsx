import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

export const GameLog = () => {
  const { gameState } = useGame();
  const { t } = useLocale();

  if (!gameState) return null;

  return (
    <Card className="h-full shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-gold/20">
      <div className="p-4 border-b border-russia-gold/20">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-russia-gold">📜</span>
          {t('game.gameLog')}
        </h3>
      </div>
      <ScrollArea className="h-[calc(100%-4rem)] p-3">
        <div className="space-y-2">
          {gameState.gameLog.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Журнал событий пуст
            </p>
          ) : (
            gameState.gameLog.slice().reverse().map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'text-sm p-3 rounded-lg border-l-4 shadow-sm backdrop-blur-sm transition-all hover:scale-102',
                  entry.type === 'success' && 'bg-board-green/20 border-board-green shadow-board-green/20',
                  entry.type === 'warning' && 'bg-russia-gold/20 border-russia-gold shadow-russia-gold/20',
                  entry.type === 'error' && 'bg-russia-red/20 border-russia-red shadow-russia-red/20',
                  entry.type === 'info' && 'bg-russia-blue/20 border-russia-blue shadow-russia-blue/20'
                )}
              >
                {t(entry.textKey, entry.params)}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
