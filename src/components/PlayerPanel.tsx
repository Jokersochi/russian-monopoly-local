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
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-foreground">{t('game.players')}</h3>
      <div className="space-y-2">
        {gameState.players.map((player, idx) => {
          const isCurrentPlayer = idx === gameState.currentPlayer;
          const ownedCells = cells.filter(c => player.properties.includes(c.id));

          return (
            <Card
              key={player.id}
              className={cn(
                'p-3 transition-all',
                isCurrentPlayer && 'ring-2 ring-primary glow-effect',
                player.bankrupt && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{player.token}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {t(`players.${player.nameKey}`)}
                    </p>
                    {isCurrentPlayer && (
                      <Badge className="bg-gradient-russian text-xs">
                        {t('game.yourTurn')}
                      </Badge>
                    )}
                    {player.bankrupt && (
                      <Badge variant="destructive" className="text-xs">
                        {t('game.bankrupt')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1 text-sm">
                    <span className="text-russia-gold font-bold">
                      {(player.money / 1000).toFixed(0)}K₽
                    </span>
                    <span className="text-muted-foreground">
                      {ownedCells.length} {t('game.properties')}
                    </span>
                  </div>
                  {player.hasResidence && (
                    <Badge variant="secondary" className="mt-1 text-xs">
                      🏰 Резиденция
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
