import { useState, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Cell } from '@/types/game';

interface PlayerStats {
  ownedCells: Cell[];
  mortgagedValue: number;
  netWorth: number;
}

export const PlayerPanel = () => {
  const { gameState, cells } = useGame();
  const { t } = useLocale();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Fast cell lookup map to avoid array searching per player
  const cellMap = useMemo(() => {
    const map = new Map<number, Cell>();
    cells?.forEach(c => map.set(c.id, c));
    return map;
  }, [cells]);

  // Performance optimization: Pre-compute owned cells, asset values, and net worth
  // for all players in a single O(P * K) pass inside useMemo instead of repeated array filtering O(P * C).
  const playerStatsMap = useMemo(() => {
    const statsMap = new Map<number, PlayerStats>();
    if (!gameState) return statsMap;

    gameState.players.forEach(player => {
      const ownedCells: Cell[] = [];
      let propertyValue = 0;
      let houseValue = 0;
      let mortgagedValue = 0;

      player.properties.forEach(cellId => {
        const cell = cellMap.get(cellId);
        if (cell) {
          ownedCells.push(cell);
          const price = cell.price || 0;
          propertyValue += price;

          const hc = gameState.houses[cellId] || 0;
          houseValue += hc * (cell.houseCost || 0);

          if (player.mortgaged.includes(cellId)) {
            mortgagedValue += Math.floor(price / 2);
          }
        }
      });

      const netWorth = player.money + propertyValue + houseValue;
      statsMap.set(player.id, {
        ownedCells,
        mortgagedValue,
        netWorth,
      });
    });

    return statsMap;
  }, [gameState, cellMap]);

  if (!gameState) return null;

  return (
    <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-gold/20">
      <div className="p-4 border-b border-russia-gold/20">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-russia-gold">👥</span>
          {t('game.players')}
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {gameState.players.map((player, idx) => {
          const isCurrentPlayer = idx === gameState.currentPlayer;
          const stats = playerStatsMap.get(player.id) || {
            ownedCells: [],
            mortgagedValue: 0,
            netWorth: player.money,
          };
          const { ownedCells, mortgagedValue, netWorth } = stats;
          const isExpanded = expandedIdx === idx;

          return (
            <Card
              key={player.id}
              className={cn(
                'transition-all border-2',
                isCurrentPlayer && 'border-russia-gold bg-gradient-gold/10 shadow-strong scale-105 glow-effect',
                !isCurrentPlayer && 'border-border/30 hover:border-russia-blue/30',
                player.bankrupt && 'opacity-50'
              )}
            >
              <div
                className="p-3 cursor-pointer select-none"
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-3">
                  <div className="text-4xl drop-shadow">{player.token}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={cn(
                        "font-bold truncate text-base",
                        isCurrentPlayer && "text-russia-gold"
                      )}>
                        {player.displayName || t(`players.${player.nameKey}`)}
                      </p>
                      {isCurrentPlayer && (
                        <Badge className="bg-gradient-russian text-xs shadow-sm">
                          ⭐ {t('game.yourTurn')}
                        </Badge>
                      )}
                      {player.inJail && (
                        <Badge variant="destructive" className="text-xs bg-orange-700 border-orange-600">
                          🔒 Тюрьма
                        </Badge>
                      )}
                      {player.bankrupt && (
                        <Badge variant="destructive" className="text-xs">
                          💸 {t('game.bankrupt')}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1.5 text-sm flex-wrap">
                      <span className="text-russia-gold font-bold text-base">
                        💰 {(player.money / 1000).toFixed(0)}K₽
                      </span>
                      <span className="text-muted-foreground">
                        🏠 {ownedCells.length}
                      </span>
                      <span className="text-emerald-400 font-semibold text-xs self-end">
                        ∑ {(netWorth / 1_000_000).toFixed(1)}M₽
                      </span>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border/30 px-3 pb-3 pt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{t('game.netWorth')}: <strong className="text-emerald-400">{(netWorth / 1_000_000).toFixed(2)}M₽</strong></span>
                    {mortgagedValue > 0 && (
                      <span className="text-orange-400">Залог: {(mortgagedValue / 1_000).toFixed(0)}K₽</span>
                    )}
                    {player.getOutOfJailCards > 0 && (
                      <span className="text-sky-400">🃏 ×{player.getOutOfJailCards}</span>
                    )}
                  </div>
                  {ownedCells.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-1">Нет владений</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {ownedCells.map(c => {
                        const isMort = player.mortgaged.includes(c.id);
                        const hc = gameState.houses[c.id] || 0;
                        return (
                          <div
                            key={c.id}
                            className={cn(
                              'flex items-center gap-2 text-xs px-2 py-1 rounded',
                              isMort ? 'bg-orange-900/30 text-orange-300' : 'bg-muted/40'
                            )}
                          >
                            {c.color && (
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: c.color }}
                              />
                            )}
                            <span className="flex-1 truncate">{t(`cells.${c.nameKey}`)}</span>
                            {hc > 0 && <span>{hc < 5 ? '🏠'.repeat(hc) : '🏨'}</span>}
                            {isMort && <span className="text-orange-400 font-bold">H</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Card>
  );
};
