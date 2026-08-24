import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';
import { LogEntry } from '@/types/game';

type Filter = 'all' | 'success' | 'info' | 'warning' | 'error';

interface FilterInfo {
  label: string;
  ariaLabel: string;
  tooltip: string;
}

const FILTER_CONFIG: Record<Filter, FilterInfo> = {
  all: { label: 'Всё', ariaLabel: 'Все события', tooltip: 'Все события' },
  success: { label: '✅', ariaLabel: 'Успешные действия', tooltip: 'Успешные действия' },
  info: { label: 'ℹ️', ariaLabel: 'Информационные сообщения', tooltip: 'Информационные сообщения' },
  warning: { label: '⚠️', ariaLabel: 'Предупреждения', tooltip: 'Предупреждения' },
  error: { label: '❌', ariaLabel: 'Ошибки и убытки', tooltip: 'Ошибки и убытки' },
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
          {(Object.entries(FILTER_CONFIG) as [Filter, FilterInfo][]).map(([key, config]) => {
            const count = key === 'all' ? gameState.gameLog.length : countByType(key as LogEntry['type']);
            const isActive = filter === key;

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => setFilter(key)}
                    aria-label={`${config.ariaLabel} (${count})`}
                    aria-pressed={isActive}
                    className={cn(
                      'h-6 px-1.5 text-xs focus-visible:ring-russia-gold',
                      isActive && 'bg-russia-gold text-black hover:bg-russia-gold/90',
                      key !== 'all' && count === 0 && 'opacity-30'
                    )}
                  >
                    <span aria-hidden="true">{config.label}</span>
                    {key !== 'all' && count > 0 && (
                      <span className="ml-0.5 opacity-70" aria-hidden="true">{count}</span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {config.tooltip} ({count})
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
