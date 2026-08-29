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

  // Single-pass optimization: count log types and reverse entries in one backward loop $O(N)$
  const { entries, counts, filtered } = useMemo(() => {
    const rawLog = gameState?.gameLog || [];
    const reversed: LogEntry[] = new Array(rawLog.length);
    const countsMap: Record<LogEntry['type'], number> = {
      success: 0,
      info: 0,
      warning: 0,
      error: 0,
    };

    const filterTarget = filter !== 'all' ? filter : null;
    const filteredList: LogEntry[] = [];

    for (let i = rawLog.length - 1, j = 0; i >= 0; i--, j++) {
      const entry = rawLog[i];
      reversed[j] = entry;
      countsMap[entry.type] = (countsMap[entry.type] || 0) + 1;
      if (!filterTarget || entry.type === filterTarget) {
        filteredList.push(entry);
      }
    }

    return {
      entries: reversed,
      counts: countsMap,
      filtered: filteredList,
    };
  }, [gameState?.gameLog, filter]);

  if (!gameState) return null;

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
            <Button
              key={key}
              size="sm"
              variant={filter === key ? 'default' : 'ghost'}
              onClick={() => setFilter(key)}
              className={cn(
                'h-6 px-1.5 text-xs',
                filter === key && 'bg-russia-gold text-black',
                key !== 'all' && (counts[key as LogEntry['type']] || 0) === 0 && 'opacity-30'
              )}
              title={key === 'all' ? 'Все события' : key}
            >
              {label}
              {key !== 'all' && (counts[key as LogEntry['type']] || 0) > 0 && (
                <span className="ml-0.5 opacity-70">{counts[key as LogEntry['type']]}</span>
              )}
            </Button>
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
