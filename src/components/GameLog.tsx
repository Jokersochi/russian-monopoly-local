import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export const GameLog = () => {
  const { gameState } = useGame();
  const { t } = useLocale();
  const [filter, setFilter] = useState<Filter>('all');

  // Performance Optimization:
  // Instead of slice().reverse() and multiple countByType O(N) array scans per render frame (up to 8 traversals),
  // compute the reversed entries and type counts in a single O(N) backward pass memoized with useMemo.
  const { reversedEntries, counts } = useMemo(() => {
    const log = gameState?.gameLog;
    const counts = { success: 0, info: 0, warning: 0, error: 0 };
    if (!log || log.length === 0) {
      return { reversedEntries: [] as LogEntry[], counts };
    }

    const reversedEntries: LogEntry[] = new Array(log.length);
    const len = log.length;
    for (let i = len - 1, j = 0; i >= 0; i--, j++) {
      const entry = log[i];
      reversedEntries[j] = entry;
      if (entry.type in counts) {
        counts[entry.type]++;
      }
    }

    return { reversedEntries, counts };
  }, [gameState]);

  if (!gameState) return null;

  const filtered = filter === 'all'
    ? reversedEntries
    : reversedEntries.filter(e => e.type === filter);

  return (
    <Card className="h-full shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-gold/20 flex flex-col">
      <div className="p-3 border-b border-russia-gold/20 flex items-center justify-between gap-2 flex-shrink-0">
        <h3 className="text-base font-bold flex items-center gap-2">
          <span className="text-russia-gold">📜</span>
          {t('game.gameLog')}
          <Badge variant="secondary" className="text-xs ml-1">{gameState.gameLog.length}</Badge>
        </h3>
        <div className="flex gap-1">
          {(Object.entries(FILTER_LABELS) as [Filter, string][]).map(([key, label]) => {
            const count = key === 'all' ? gameState.gameLog.length : counts[key as keyof typeof counts] || 0;
            return (
              <Button
                key={key}
                size="sm"
                variant={filter === key ? 'default' : 'ghost'}
                onClick={() => setFilter(key)}
                className={cn(
                  'h-6 px-1.5 text-xs',
                  filter === key && 'bg-russia-gold text-black',
                  key !== 'all' && count === 0 && 'opacity-30'
                )}
                title={key === 'all' ? 'Все события' : key}
              >
                {label}
                {key !== 'all' && count > 0 && (
                  <span className="ml-0.5 opacity-70">{count}</span>
                )}
              </Button>
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
