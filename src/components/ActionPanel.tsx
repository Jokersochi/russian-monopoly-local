import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';

export const ActionPanel = () => {
  const { gameState, buyProperty, passProperty, endTurn, cells } = useGame();
  const { t } = useLocale();

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const currentCell = cells[currentPlayer.position];
  const canBuy = gameState.phase === 'landed' && 
                 currentCell.price && 
                 !gameState.players.some(p => p.properties.includes(currentCell.id)) &&
                 currentPlayer.money >= (currentCell.price || 0);

  const canPass = gameState.phase === 'landed' && currentCell.price;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-center">
        <h3 className="font-bold text-lg mb-2">{t('game.currentPlayer')}</h3>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl">{currentPlayer.token}</span>
          <div>
            <p className="font-semibold">{t(`players.${currentPlayer.nameKey}`)}</p>
            <p className="text-sm text-russia-gold font-bold">
              {(currentPlayer.money / 1000).toFixed(0)}K₽
            </p>
          </div>
        </div>
      </div>

      {gameState.phase === 'landed' && currentCell.price && (
        <Card className="p-3 bg-muted">
          <h4 className="font-semibold mb-2">{t(`cells.${currentCell.nameKey}`)}</h4>
          <div className="space-y-1 text-sm">
            <p>💰 Цена: {(currentCell.price / 1000).toFixed(0)}K₽</p>
            {currentCell.rent && (
              <p>🏠 Аренда: {(currentCell.rent[0] / 1000).toFixed(0)}K₽</p>
            )}
            {currentCell.category && (
              <p>📂 {currentCell.category}</p>
            )}
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {canBuy && (
          <Button
            onClick={buyProperty}
            className="w-full bg-gradient-gold hover:opacity-90"
            size="lg"
          >
            {t('game.buy')} ({(currentCell.price! / 1000).toFixed(0)}K₽)
          </Button>
        )}

        {canPass && (
          <Button
            onClick={passProperty}
            variant="outline"
            className="w-full"
          >
            {t('game.pass')}
          </Button>
        )}

        {gameState.phase === 'landed' && !currentCell.price && (
          <Button
            onClick={endTurn}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            {t('game.endTurn')}
          </Button>
        )}
      </div>

      <div className="text-xs text-center text-muted-foreground pt-2 border-t">
        Фаза: {gameState.phase} | Раунд: {gameState.round}
      </div>
    </Card>
  );
};
