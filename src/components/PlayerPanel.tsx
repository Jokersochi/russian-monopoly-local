import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const PlayerPanel = () => {
  const { gameState, cells } = useGame();
  const { t } = useLocale();

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

          return (
            <Card
              key={player.id}
              className={cn(
                'p-3 transition-all border-2',
                isCurrentPlayer && 'border-russia-gold bg-gradient-gold/10 shadow-strong scale-105 glow-effect',
                !isCurrentPlayer && 'border-border/30 hover:border-russia-blue/30',
                player.bankrupt && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl drop-shadow">{player.token}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn(
                      "font-bold truncate text-base",
                      isCurrentPlayer && "text-russia-gold"
                    )}>
                      {t(`players.${player.nameKey}`)}
                    </p>
                    {isCurrentPlayer && (
                      <Badge className="bg-gradient-russian text-xs shadow-sm">
                        ⭐ {t('game.yourTurn')}
                      </Badge>
                    )}
                    {player.bankrupt && (
                      <Badge variant="destructive" className="text-xs">
                        💸 {t('game.bankrupt')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1.5 text-sm">
                    <span className="text-russia-gold font-bold text-base">
                      💰 {(player.money / 1000).toFixed(0)}K₽
                    </span>
                    <span className="text-muted-foreground">
                      🏠 {ownedCells.length} {t('game.properties')}
                    </span>
                  </div>
                  {player.hasResidence && (
                    <Badge variant="secondary" className="mt-2 text-xs bg-russia-blue/20 border-russia-blue/30">
                      🏰 Резиденция
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Card>
  );
};
