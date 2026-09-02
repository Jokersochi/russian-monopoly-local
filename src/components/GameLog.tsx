import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';
import { LogEntry } from '@/types/game';

type Filter = 'all' | 'success' | 'info' | 'warning' | 'error';

const FILTER_LABELS: Record<Filter, { icon: string; name: string }> = {
  all: { icon: 'Всё', name: 'Все события' },
  success: { icon: '✅', name: 'Успешные события' },
  info: { icon: 'ℹ️', name: 'Информационные события' },
  warning: { icon: '⚠️', name: 'Предупреждения' },
  error: { icon: '❌', name: 'Ошибки' },
};

export const GameLog = () => {
  const { gameState } = useGame();
  const { t } = useLocale();
  const [filter, setFilter] = useState<Filter>('all');

  if (!gameState) return null;

  const entries = gameState.gameLog.slice().reverse();
  const filtered = filter === 'all' ? entries : entries.filter(e => e.type === filter);
  const countByType = (type: LogEntry['type']) => gameState.gameLog.filter(e => e.type === type).length;

  return (
    <Card className="h-full shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-gold/20 flex flex-col">
      <div className="p-3 border-b border-russia-gold/20 flex items-center justify-between gap-2 flex-shrink-0">
        <h3 className="text-base font-bold flex items-center gap-2">
          <span className="text-russia-gold">📜</span>
          {t('game.gameLog')}
          <Badge variant="secondary" className="text-xs ml-1">{gameState.gameLog.length}</Badge>
        </h3>
        <div className="flex gap-1" role="group" aria-label="Фильтр журнала событий">
          {(Object.entries(FILTER_LABELS) as [Filter, { icon: string; name: string }][]).map(([key, { icon, name }]) => {
            const count = key === 'all' ? gameState.gameLog.length : countByType(key as LogEntry['type']);
            const isSelected = filter === key;
            const ariaLabel = key === 'all' ? `${name}, ${count}` : `${name}, ${count} элементов`;

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={isSelected ? 'default' : 'ghost'}
                    onClick={() => setFilter(key)}
                    aria-label={ariaLabel}
                    aria-pressed={isSelected}
                    className={cn(
                      'h-6 px-1.5 text-xs focus-visible:ring-2 focus-visible:ring-russia-gold focus-visible:ring-offset-1',
                      isSelected && 'bg-russia-gold text-black hover:bg-russia-gold/90',
                      key !== 'all' && count === 0 && 'opacity-40'
                    )}
                  >
                    <span aria-hidden="true">{icon}</span>
                    {key !== 'all' && count > 0 && (
                      <span aria-hidden="true" className="ml-0.5 opacity-70">
                        {count}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-semibold">
                  {name} ({count})
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1.5">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {filter === 'all' ? 'Журнал событий пуст' : 'Нет событий этого типа'}
            </p>
          ) : (
            filtered.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'text-xs p-2.5 rounded-lg border-l-4 shadow-sm',
                  entry.type === 'success' && 'bg-board-green/15 border-board-green/70',
                  entry.type === 'warning' && 'bg-russia-gold/15 border-russia-gold/70',
                  entry.type === 'error'   && 'bg-russia-red/15 border-russia-red/70',
                  entry.type === 'info'    && 'bg-russia-blue/15 border-russia-blue/70'
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
