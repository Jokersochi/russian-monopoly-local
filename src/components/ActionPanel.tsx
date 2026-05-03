import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';

export const ActionPanel = () => {
  const { gameState, buyProperty, passProperty, endTurn, payJailFine, buildHouse, cells } = useGame();
  const { t } = useLocale();

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const currentCell = cells[currentPlayer.position];
  const canBuy = gameState.phase === 'landed' &&
                 currentCell.price &&
                 !gameState.players.some(p => p.properties.includes(currentCell.id)) &&
                 currentPlayer.money >= (currentCell.price || 0);

  const canPass = gameState.phase === 'landed' && currentCell.price;

  const buildableProperties = currentPlayer.properties
    .map((id) => cells[id])
    .filter((c) => c?.houseCost && (currentPlayer.houses?.[c.id] ?? 0) < 5);

  return (
    <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-blue/20">
      <div className="p-4 border-b border-russia-blue/20">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-russia-blue">⚡</span>
          {t('game.actions')}
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="text-center p-3 bg-gradient-to-r from-russia-blue/10 to-russia-red/10 rounded-lg border border-russia-gold/30">
          <p className="text-xs text-muted-foreground mb-1">{t('game.currentPlayer')}</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl drop-shadow">{currentPlayer.token}</span>
            <div>
              <p className="font-bold text-lg">{t(`players.${currentPlayer.nameKey}`)}</p>
              <p className="text-sm text-russia-gold font-bold">
                💰 {(currentPlayer.money / 1000).toFixed(0)}K₽
              </p>
            </div>
          </div>
        </div>

        {gameState.phase === 'rolling' && currentPlayer.inJail && (
          <div className="p-3 bg-russia-red/10 rounded-lg border border-russia-red/30 space-y-2">
            <p className="text-sm font-bold text-russia-red flex items-center gap-2">
              🔒 {t('game.inJail')}
              <span className="text-xs font-normal text-muted-foreground">
                ({currentPlayer.jailTurns}/3)
              </span>
            </p>
            <Button
              onClick={payJailFine}
              variant="outline"
              className="w-full border-russia-red/50 hover:bg-russia-red/20 text-sm"
              disabled={currentPlayer.money < 500000}
            >
              💰 {t('game.payJailFine')}
            </Button>
          </div>
        )}

        {gameState.phase === 'rolling' && !currentPlayer.inJail && buildableProperties.length > 0 && (
          <div className="p-3 bg-russia-gold/10 rounded-lg border border-russia-gold/30 space-y-2">
            <p className="text-sm font-bold text-russia-gold flex items-center gap-2">
              🏗️ {t('game.yourProperties')}
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {buildableProperties.map((cell) => {
                const count = currentPlayer.houses?.[cell.id] ?? 0;
                const cost = cell.houseCost!;
                const disabled = currentPlayer.money < cost;
                return (
                  <div
                    key={cell.id}
                    className="flex items-center justify-between gap-2 p-2 bg-card/50 rounded text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {t(`cells.${cell.nameKey}`)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {count === 5
                          ? `🏨 ${t('game.hotel')}`
                          : `🏠 ${count}/4 · ${(cost / 1000).toFixed(0)}K₽`}
                      </p>
                    </div>
                    <Button
                      onClick={() => buildHouse(cell.id)}
                      disabled={disabled}
                      size="sm"
                      variant="outline"
                      className="border-russia-gold/50 hover:bg-russia-gold/20 shrink-0"
                    >
                      {count === 4 ? '🏨' : '🏠'} +
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gameState.phase === 'landed' && currentCell.price && (
          <Card className="p-4 bg-gradient-to-br from-muted/80 to-muted/50 border-2 border-russia-gold/30 shadow-sm">
            <h4 className="font-bold mb-3 text-base flex items-center gap-2">
              <span className="text-russia-gold">🏛️</span>
              {t(`cells.${currentCell.nameKey}`)}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-card/50 rounded">
                <span>💰 Цена:</span>
                <span className="font-bold text-russia-gold">{(currentCell.price / 1000).toFixed(0)}K₽</span>
              </div>
              {currentCell.rent && (
                <div className="flex justify-between p-2 bg-card/50 rounded">
                  <span>🏠 Аренда:</span>
                  <span className="font-bold">{(currentCell.rent[0] / 1000).toFixed(0)}K₽</span>
                </div>
              )}
              {currentCell.category && (
                <div className="flex justify-between p-2 bg-card/50 rounded">
                  <span>📂 Категория:</span>
                  <span className="font-semibold">{currentCell.category}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="space-y-2">
          {canBuy && (
            <Button
              onClick={buyProperty}
              className="w-full h-14 text-lg font-bold bg-gradient-gold hover:opacity-90 shadow-strong transition-all hover:scale-105"
              size="lg"
            >
              💎 {t('game.buy')} ({(currentCell.price! / 1000).toFixed(0)}K₽)
            </Button>
          )}

          {canPass && (
            <Button
              onClick={passProperty}
              variant="outline"
              className="w-full h-12 border-2 hover:border-russia-red hover:bg-russia-red/10"
            >
              ❌ {t('game.pass')}
            </Button>
          )}

          {gameState.phase === 'landed' && !currentCell.price && (
            <Button
              onClick={endTurn}
              className="w-full h-14 text-lg font-bold bg-gradient-russian hover:opacity-90 shadow-strong transition-all hover:scale-105"
              size="lg"
            >
              ➡️ {t('game.endTurn')}
            </Button>
          )}
        </div>

        <div className="text-xs text-center text-muted-foreground pt-3 border-t border-border/50 space-y-1">
          <div>⚙️ Фаза: <span className="font-semibold">{gameState.phase}</span></div>
          <div>🔄 Раунд: <span className="font-semibold">{gameState.round}</span></div>
        </div>
      </div>
    </Card>
  );
};
