import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';

export const GameBoard = () => {
  const { cells, gameState } = useGame();
  const { t } = useLocale();

  if (!gameState) return null;

  const getCellStyle = (position: { x: number; y: number }) => {
    const size = 80;
    const gap = 2;
    return {
      position: 'absolute' as const,
      left: `${position.x * (size + gap)}px`,
      top: `${position.y * (size + gap)}px`,
      width: `${size}px`,
      height: `${size}px`,
    };
  };

  const isOwnedBy = (cellId: number) => {
    return gameState.players.find(p => p.properties.includes(cellId));
  };

  const getPlayersOnCell = (cellId: number) => {
    return gameState.players.filter(p => p.position === cellId && !p.bankrupt);
  };

  return (
    <div className="relative bg-board-green rounded-lg shadow-board p-8">
      <div className="relative" style={{ width: '902px', height: '902px' }}>
        {cells.map((cell) => {
          const owner = isOwnedBy(cell.id);
          const playersHere = getPlayersOnCell(cell.id);

          const cellStyle = {
            ...getCellStyle(cell.position),
            ...(cell.color && { borderTopColor: cell.color }),
          };

          return (
            <div
              key={cell.id}
              style={cellStyle}
              className={cn(
                'border-2 border-foreground/20 rounded-md bg-card flex flex-col items-center justify-center p-1 text-center transition-all hover:scale-105',
                owner && 'ring-2 ring-russia-gold',
                cell.color && 'border-t-8'
              )}
            >
              <div className="text-[10px] font-bold leading-tight overflow-hidden">
                {t(`cells.${cell.nameKey}`)}
              </div>
              {cell.price && (
                <div className="text-[8px] text-muted-foreground mt-1">
                  {(cell.price / 1000).toFixed(0)}K₽
                </div>
              )}
              {playersHere.length > 0 && (
                <div className="absolute -bottom-2 flex gap-0.5">
                  {playersHere.map((player) => (
                    <span key={player.id} className="text-xs">
                      {player.token}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Center area with game info */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-card/80 backdrop-blur rounded-lg shadow-lg flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-russian bg-clip-text text-transparent mb-2">
              {t('game.title')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t('game.currentPlayer')}: {gameState.players[gameState.currentPlayer].token}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Раунд {gameState.round}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
