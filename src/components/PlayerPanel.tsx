import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const PlayerPanel = () => {
  const { gameState, cells } = useGame();
  const { t } = useLocale();
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

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
          const ownedCells = cells.filter(c => player.properties.includes(c.id));
          const propertyValue = ownedCells.reduce((sum, c) => sum + (c.price || 0), 0);
          const houseValue = ownedCells.reduce((sum, c) => {
            const hc = gameState.houses[c.id] || 0;
            return sum + hc * (c.houseCost || 0);
          }, 0);
          const mortgagedValue = ownedCells
            .filter(c => player.mortgaged.includes(c.id))
            .reduce((sum, c) => sum + Math.floor((c.price || 0) / 2), 0);
          const netWorth = player.money + propertyValue + houseValue;
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
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
                aria-controls={`player-details-${player.id}`}
                className="p-3 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-russia-gold focus-visible:ring-offset-1 rounded-t-lg"
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (e.key === ' ') e.preventDefault();
                    setExpandedIdx(isExpanded ? null : idx);
                  }
                }}
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
                <div id={`player-details-${player.id}`} className="border-t border-border/30 px-3 pb-3 pt-2 space-y-1">
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
