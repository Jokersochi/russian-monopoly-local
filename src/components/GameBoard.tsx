import { memo, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';
import { Cell } from '@/types/game';

interface BoardCellProps {
  cell: Cell;
  ownerToken?: string;
  playerTokens: string[];
  t: (key: string, params?: Record<string, string | number>) => string;
  style: React.CSSProperties;
}

const EMPTY_ARRAY: string[] = [];

const BoardCell = memo(({ cell, ownerToken, playerTokens, t, style }: BoardCellProps) => {
  return (
    <div
      style={style}
      className={cn(
        'border-2 rounded-lg bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center p-1.5 text-center transition-all hover:scale-110 hover:shadow-strong hover:z-10',
        ownerToken && 'ring-4 ring-russia-gold shadow-strong',
        !ownerToken && 'border-foreground/20 hover:border-russia-blue/50',
        cell.color && 'border-t-[10px]'
      )}
    >
      <div className="text-[10px] font-bold leading-tight overflow-hidden">
        {t(`cells.${cell.nameKey}`)}
      </div>
      {cell.price && (
        <div className="text-[9px] text-russia-gold font-bold mt-1">
          💰 {(cell.price / 1000).toFixed(0)}K
        </div>
      )}
      {ownerToken && (
        <div className="text-[8px] mt-0.5 text-russia-gold">
          👤 {ownerToken}
        </div>
      )}
      {playerTokens.length > 0 && (
        <div className="absolute -bottom-3 flex gap-0.5 bg-card/90 backdrop-blur-sm rounded-full px-1 shadow-sm border border-russia-gold/30">
          {playerTokens.map((token) => (
            <span key={token} className="text-base drop-shadow">
              {token}
            </span>
          ))}
        </div>
      )}
    </div>
  );
});

BoardCell.displayName = 'BoardCell';

export const GameBoard = () => {
  const { cells, gameState } = useGame();
  const { t } = useLocale();

  // Optimization: Map cell ownership for O(1) lookup
  const ownersMap = useMemo(() => {
    if (!gameState) return {};
    const map: Record<number, string> = {};
    gameState.players.forEach(p => {
      p.properties.forEach(cellId => {
        map[cellId] = p.token;
      });
    });
    return map;
  }, [gameState]);

  // Optimization: Map players on cells for O(1) lookup
  const playersOnCellMap = useMemo(() => {
    if (!gameState) return {};
    const map: Record<number, string[]> = {};
    gameState.players.forEach(p => {
      if (!p.bankrupt) {
        if (!map[p.position]) map[p.position] = [];
        map[p.position].push(p.token);
      }
    });
    return map;
  }, [gameState]);

  // Optimization: Memoize cell styles as they are mostly static
  const cellStylesMap = useMemo(() => {
    const size = 80;
    const gap = 2;
    const styles: Record<number, React.CSSProperties> = {};
    cells.forEach(cell => {
      styles[cell.id] = {
        position: 'absolute' as const,
        left: `${cell.position.x * (size + gap)}px`,
        top: `${cell.position.y * (size + gap)}px`,
        width: `${size}px`,
        height: `${size}px`,
        ...(cell.color && { borderTopColor: cell.color }),
      };
    });
    return styles;
  }, [cells]);

  if (!gameState) return null;

  return (
    <div className="relative bg-gradient-board rounded-2xl shadow-board p-8 border-8 border-russia-gold backdrop-blur-sm">
      {/* Decorative corners */}
      <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-russia-gold/80 rounded-tl-xl"></div>
      <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-russia-gold/80 rounded-tr-xl"></div>
      <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-russia-gold/80 rounded-bl-xl"></div>
      <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-russia-gold/80 rounded-br-xl"></div>
      
      <div className="relative" style={{ width: '902px', height: '902px' }}>
        {cells.map((cell) => (
          <BoardCell
            key={cell.id}
            cell={cell}
            ownerToken={ownersMap[cell.id]}
            playerTokens={playersOnCellMap[cell.id] || EMPTY_ARRAY}
            t={t}
            style={cellStylesMap[cell.id]}
          />
        ))}

        {/* Center area with game info */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md rounded-2xl shadow-board border-4 border-russia-gold/30 flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <div className="mb-4">
              <h2 className="text-5xl font-bold bg-gradient-russian bg-clip-text text-transparent drop-shadow-lg mb-2">
                {t('game.title')}
              </h2>
              <div className="h-1 w-32 mx-auto bg-gradient-gold rounded-full"></div>
            </div>
            
            <div className="space-y-3 p-4 bg-gradient-to-r from-russia-blue/10 to-russia-red/10 rounded-xl border border-russia-gold/20">
              <p className="text-sm text-muted-foreground font-semibold">
                {t('game.currentPlayer')}:
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl drop-shadow-lg glow-effect">
                  {gameState.players[gameState.currentPlayer].token}
                </span>
                <div className="text-left">
                  <p className="text-xl font-bold text-russia-gold">
                    {t(`players.${gameState.players[gameState.currentPlayer].nameKey}`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    💰 {(gameState.players[gameState.currentPlayer].money / 1000).toFixed(0)}K₽
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <span className="text-russia-gold">🔄</span>
                <span>Раунд {gameState.round}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground"></div>
              <div className="flex items-center gap-1">
                <span className="text-russia-blue">⚙️</span>
                <span>{gameState.phase}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
