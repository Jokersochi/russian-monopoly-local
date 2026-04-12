import { useMemo } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useLocale } from '@/contexts/LocaleContext';
import { cn } from '@/lib/utils';
import { BOARD_CELLS } from '@/data/board';
import { Player } from '@/types/game';

export const GameBoard = () => {
  const { gameState } = useGameStore();
  const { t } = useLocale();

  const propertyOwners = useMemo(() => {
    const owners = new Map<number, Player>();
    if (!gameState) return owners;
    gameState.players.forEach(player => {
      player.properties.forEach(cellId => {
        owners.set(cellId, player);
      });
    });
    return owners;
  }, [gameState]);

  const playerPositions = useMemo(() => {
    const positions = new Map<number, Player[]>();
    if (!gameState) return positions;
    gameState.players.forEach(player => {
      if (player.bankrupt) return;
      const players = positions.get(player.position) || [];
      positions.set(player.position, [...players, player]);
    });
    return positions;
  }, [gameState]);

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
      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 2px 2px 5px rgba(0,0,0,0.3)',
      backgroundColor: '#f5e6d3', // Light parchment/wood color
    };
  };

  return (
    <div className="relative bg-wood-texture rounded-3xl shadow-2xl p-6 border-[12px] border-wood-light ring-[1px] ring-white/10">
      <div className="relative" style={{ width: '902px', height: '902px' }}>
        {BOARD_CELLS.map((cell) => {
          const owner = propertyOwners.get(cell.id);
          const playersHere = playerPositions.get(cell.id) || [];

          const cellStyle = {
            ...getCellStyle(cell.position),
            ...(cell.color && { borderTopColor: cell.color }),
          };

          return (
            <div
              key={cell.id}
              style={cellStyle}
              className={cn(
                'border-[1px] border-black/10 rounded-sm flex flex-col items-center justify-center p-1.5 text-center transition-all hover:scale-110 hover:z-10',
                owner && 'ring-2 ring-russia-gold',
                cell.color && 'border-t-[12px]'
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
              {owner && (
                <div className="text-[8px] mt-0.5 text-russia-gold">
                  👤 {owner.token}
                </div>
              )}
              {playersHere.length > 0 && (
                <div className="absolute -bottom-3 flex gap-0.5 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-lg border border-black/10 z-20">
                  {playersHere.map((player) => (
                    <span key={player.id} className="text-xl drop-shadow-md animate-bounce" style={{ animationDuration: '2s' }}>
                      {player.token}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Center area - Curved Metal Display for Log */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[720px] flex flex-col items-center justify-center pointer-events-none">
          <div className="relative w-full h-full bg-metal-texture rounded-[60px] shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),0_20px_40px_rgba(0,0,0,0.4)] border-x-[15px] border-metal-dark overflow-hidden flex flex-col">
            <div className="flex-1 p-10 flex flex-col items-center pointer-events-auto">
               <div className="w-full text-center mb-8 border-b border-black/10 pb-4">
                  <h2 className="text-2xl font-serif italic text-metal-dark tracking-widest opacity-80 uppercase">
                    Monopoly Club
                  </h2>
               </div>
               <div className="flex-1 w-full overflow-hidden">
                  <div className="h-full flex flex-col items-center justify-center space-y-6 text-center font-serif">
                     <div className="p-4 bg-white/50 backdrop-blur-sm rounded-lg shadow-inner w-full">
                        <p className="text-lg italic text-black/70">Вы вошли в качестве зрителя</p>
                        <p className="text-sm text-black/50 tracking-tighter">...</p>
                        <p className="text-base font-bold text-black/80">Ход игрока {t(`players.${gameState.players[gameState.currentPlayer].nameKey}`)}</p>
                        <p className="text-sm text-black/50 tracking-tighter">...</p>
                        <p className="text-base text-black/80">Выброшено: {gameState.dice[0]} и {gameState.dice[1]}</p>
                     </div>
                     <div className="flex-1 overflow-y-auto w-full px-4 space-y-2 py-4 scrollbar-hide">
                        {[...gameState.gameLog].reverse().slice(0, 5).map((entry) => (
                           <p key={entry.id} className="text-sm italic text-black/60 border-b border-black/5 pb-1">
                              {t(entry.textKey, entry.params)}
                           </p>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="mt-8">
                  <button
                    onClick={() => useGameStore.getState().resetGame()}
                    className="px-8 py-3 bg-[#4CAF50] hover:bg-[#45a049] text-white font-bold rounded-lg shadow-lg border-2 border-black/20 transition-transform hover:scale-105 active:scale-95"
                  >
                    ПОКИНУТЬ ИГРОВОЙ ЗАЛ
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
