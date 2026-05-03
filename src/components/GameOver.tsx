import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

const computeNetWorth = (
  player: { money: number; properties: number[]; bankrupt: boolean },
  cells: { id: number; price?: number }[]
): number => {
  if (player.bankrupt) return 0;
  const propertyValue = player.properties.reduce(
    (sum, cellId) => sum + (cells[cellId]?.price ?? 0),
    0
  );
  return player.money + propertyValue;
};

export const GameOver = () => {
  const { gameState, cells, resetGame } = useGame();
  const { t } = useLocale();

  if (!gameState || gameState.phase !== 'game-over') return null;

  const ranked = gameState.players
    .map((p) => ({ player: p, netWorth: computeNetWorth(p, cells) }))
    .sort((a, b) => b.netWorth - a.netWorth);

  const winner = ranked[0]?.player;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-board opacity-20"></div>
      <Card className="w-full max-w-lg shadow-strong backdrop-blur-sm bg-card/95 border-2 border-russia-gold/40 relative z-10">
        <CardHeader className="text-center space-y-3">
          <div className="text-7xl drop-shadow">🏆</div>
          <CardTitle className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            {t('game.gameOver')}
          </CardTitle>
          {winner && !winner.bankrupt && (
            <p className="text-lg">
              <span className="text-3xl mr-2">{winner.token}</span>
              <span className="font-bold text-russia-gold">
                {t(`players.${winner.nameKey}`)}
              </span>
              {' — '}
              <span className="text-russia-gold font-bold">
                {ranked[0].netWorth.toLocaleString()}₽
              </span>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {ranked.map((entry, i) => (
              <div
                key={entry.player.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2',
                  i === 0 && !entry.player.bankrupt && 'border-russia-gold bg-gradient-gold/10',
                  (i !== 0 || entry.player.bankrupt) && 'border-border/40 bg-muted/30',
                  entry.player.bankrupt && 'opacity-60'
                )}
              >
                <span className="text-2xl font-bold w-8 text-center">
                  {i === 0 && !entry.player.bankrupt ? '🥇' : `#${i + 1}`}
                </span>
                <span className="text-3xl">{entry.player.token}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">
                    {t(`players.${entry.player.nameKey}`)}
                    {entry.player.bankrupt && (
                      <span className="ml-2 text-xs text-russia-red">
                        💸 {t('game.bankrupt')}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.player.bankrupt
                      ? '—'
                      : `${entry.netWorth.toLocaleString()}₽`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={resetGame}
            className="w-full bg-gradient-russian hover:opacity-90 text-lg py-7 shadow-strong transition-all hover:scale-105 font-bold"
            size="lg"
          >
            ✨ {t('game.newGame')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
