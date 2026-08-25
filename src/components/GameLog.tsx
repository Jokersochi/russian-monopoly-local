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

const FILTER_LABELS: Record<Filter, string> = {
  all: 'Всё',
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
};

const FILTER_NAMES: Record<Filter, string> = {
  all: 'Все события',
  success: 'Успешные события',
  info: 'Информационные события',
  warning: 'Предупреждения',
  error: 'Ошибки',
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
        <div className="flex gap-1">
          {(Object.entries(FILTER_LABELS) as [Filter, string][]).map(([key, label]) => (
            <Tooltip key={key}>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={filter === key ? 'default' : 'ghost'}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'h-6 px-1.5 text-xs focus-visible:ring-2 focus-visible:ring-russia-gold',
                    filter === key && 'bg-russia-gold text-black',
                    key !== 'all' && countByType(key as LogEntry['type']) === 0 && 'opacity-30'
                  )}
                  aria-label={`Фильтр: ${FILTER_NAMES[key]}`}
                  aria-pressed={filter === key}
                >
                  {label}
                  {key !== 'all' && countByType(key as LogEntry['type']) > 0 && (
                    <span className="ml-0.5 opacity-70">{countByType(key as LogEntry['type'])}</span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {FILTER_NAMES[key]}
              </TooltipContent>
            </Tooltip>
          ))}
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
