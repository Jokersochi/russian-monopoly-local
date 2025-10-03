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
    <Card className="h-full">
      <div className="p-3 border-b">
        <h3 className="font-bold">{t('game.gameLog')}</h3>
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
                  'text-sm p-2 rounded border-l-4',
                  entry.type === 'success' && 'bg-green-50 dark:bg-green-950 border-green-500',
                  entry.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-950 border-yellow-500',
                  entry.type === 'error' && 'bg-red-50 dark:bg-red-950 border-red-500',
                  entry.type === 'info' && 'bg-blue-50 dark:bg-blue-950 border-blue-500'
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
