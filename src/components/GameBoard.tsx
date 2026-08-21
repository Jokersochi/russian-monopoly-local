import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { PropertyModal } from '@/components/PropertyModal';
import { Cell } from '@/types/game';
import { cn } from '@/lib/utils';

const HOUSE_DOTS = ['', '🏠', '🏠🏠', '🏠🏠🏠', '🏠🏠🏠🏠', '🏨'];

export const GameBoard = () => {
  const { cells, gameState } = useGame();
  const { t } = useLocale();
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [justLandedIds, setJustLandedIds] = useState<Set<number>>(new Set());
  const prevPositions = useRef<Record<number, number>>({});

  const playerPosKey = gameState?.players ? gameState.players.map(p => p.position + ':' + p.id).join(',') : '';

  useEffect(() => {
    if (!gameState) return;
    const movedIds: number[] = [];
    gameState.players.forEach((p) => {
      const prev = prevPositions.current[p.id];
      if (prev !== undefined && prev !== p.position) {
        movedIds.push(p.id);
      }
      prevPositions.current[p.id] = p.position;
    });
    if (movedIds.length > 0) {
      setJustLandedIds(new Set(movedIds));
      const timer = setTimeout(() => setJustLandedIds(new Set()), 700);
      return () => clearTimeout(timer);
    }
  }, [playerPosKey]);

  // Memoize property ownership map, player cell locations, and net worth standings in O(P + C) time
  const { propertyOwnerMap, cellPlayersMap, sortedStandings } = useMemo(() => {
    type PlayerType = NonNullable<typeof gameState>['players'][0];
    const ownerMap = new Map<number, PlayerType>();
    const posMap = new Map<number, PlayerType[]>();
    const standings: Array<{ p: PlayerType; net: number }> = [];

    if (!gameState) {
      return { propertyOwnerMap: ownerMap, cellPlayersMap: posMap, sortedStandings: standings };
    }

    const { players = [], houses = {} } = gameState;

    for (let i = 0; i < players.length; i++) {
      const p = players[i];

      // Map properties owned by player p
      for (let j = 0; j < p.properties.length; j++) {
        ownerMap.set(p.properties[j], p);
      }

      // Map players on cell
      let playersOnCell = posMap.get(p.position);
      if (!playersOnCell) {
        playersOnCell = [];
        posMap.set(p.position, playersOnCell);
      }
      playersOnCell.push(p);

      // Calculate net worth
      let propVal = 0;
      let houseVal = 0;
      for (let j = 0; j < p.properties.length; j++) {
        const pid = p.properties[j];
        const cell = cells[pid]?.id === pid ? cells[pid] : cells.find(c => c.id === pid);
        if (cell) {
          propVal += cell.price || 0;
          houseVal += (houses[pid] || 0) * (cell.houseCost || 0);
        }
      }
      standings.push({ p, net: p.money + propVal + houseVal });
    }

    standings.sort((a, b) => b.net - a.net);

    return { propertyOwnerMap: ownerMap, cellPlayersMap: posMap, sortedStandings: standings };
  }, [gameState, cells]);

  if (!gameState) return null;

  const { players = [], currentPlayer: cpIdx = 0, houses = {} } = gameState;
  const currentPlayer = players[cpIdx];
  if (!currentPlayer) return null;

  const pname = (p: typeof players[0]) => p.displayName || t(`players.${p.nameKey}`);

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

  const getOwner = (cellId: number) => propertyOwnerMap.get(cellId);
  const getPlayersOnCell = (cellId: number) => cellPlayersMap.get(cellId) || [];

  return (
    <>
      <div className="relative bg-gradient-board rounded-2xl shadow-board p-8 border-8 border-russia-gold backdrop-blur-sm">
        {/* Decorative corners */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-russia-gold/80 rounded-tl-xl" />
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-russia-gold/80 rounded-tr-xl" />
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-russia-gold/80 rounded-bl-xl" />
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-russia-gold/80 rounded-br-xl" />

        <div className="relative" style={{ width: '902px', height: '902px' }}>
          {cells.map((cell) => {
            const owner = getOwner(cell.id);
            const playersHere = getPlayersOnCell(cell.id);
            const houseCount = houses[cell.id] || 0;
            const isCurrentPlayerHere = currentPlayer.position === cell.id;
            const isOwnedByCurrentPlayer = owner?.id === currentPlayer.id;
            const isUnowned = !owner && !!cell.price;
            const isOtherPlayerOwned = owner && owner.id !== currentPlayer.id;

            const cellStyle = {
              ...getCellStyle(cell.position),
              ...(cell.color && { borderTopColor: cell.color }),
            };

            return (
              <div
                key={cell.id}
                style={cellStyle}
                onClick={() => (cell.price || cell.type === 'transport' || cell.type === 'utility') && setSelectedCell(cell)}
                className={cn(
                  'border-2 rounded-lg bg-card/95 backdrop-blur-sm flex flex-col items-center justify-center p-1.5 text-center transition-all hover:z-10',
                  cell.price || cell.type === 'transport' || cell.type === 'utility'
                    ? 'cursor-pointer hover:scale-110 hover:shadow-strong'
                    : 'cursor-default',
                  cell.color && 'border-t-[10px]',
                  isCurrentPlayerHere && 'ring-4 ring-russia-blue shadow-[0_0_12px_rgba(0,100,255,0.6)] scale-105 z-20',
                  isOwnedByCurrentPlayer && !isCurrentPlayerHere && 'ring-2 ring-russia-gold/70 bg-russia-gold/5',
                  isOtherPlayerOwned && !isCurrentPlayerHere && 'ring-2 ring-russia-red/40 bg-russia-red/5',
                  isUnowned && !isCurrentPlayerHere && 'border-board-green/40 hover:border-board-green',
                  !owner && !cell.price && 'border-foreground/20',
                )}
              >
                <div className="text-[9px] font-bold leading-tight overflow-hidden max-h-[28px]">
                  {t(`cells.${cell.nameKey}`)}
                </div>

                {cell.price && (
                  <div className="text-[8px] text-russia-gold font-bold mt-0.5">
                    {(cell.price / 1_000).toFixed(0)}K₽
                  </div>
                )}

                {houseCount > 0 && (
                  <div className="text-[8px] leading-none mt-0.5" title={`${houseCount < 5 ? houseCount + ' дом(а)' : 'Отель'}`}>
                    {houseCount < 5 ? '🏠'.repeat(houseCount) : '🏨'}
                  </div>
                )}

                {owner && !houseCount && (
                  <div className="text-[10px] mt-0.5" title={pname(owner)}>
                    {owner.token}
                  </div>
                )}

                {owner && houseCount > 0 && (
                  <div className="text-[8px] mt-0.5 opacity-70" title={pname(owner)}>
                    {owner.token}
                  </div>
                )}

                {playersHere.length > 0 && (
                  <div className="absolute -bottom-3 flex gap-0.5 bg-card/90 backdrop-blur-sm rounded-full px-1 shadow-sm border border-russia-gold/30 z-30">
                    {playersHere.map((player) => (
                      <span
                        key={player.id}
                        className={cn(
                          'text-base drop-shadow transition-transform',
                          justLandedIds.has(player.id) && 'animate-bounce'
                        )}
                      >
                        {player.token}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Center area */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-md rounded-2xl shadow-board border-4 border-russia-gold/30 flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <div className="mb-4">
                <h2 className="text-5xl font-bold bg-gradient-russian bg-clip-text text-transparent drop-shadow-lg mb-2">
                  {t('game.title')}
                </h2>
                <div className="h-1 w-32 mx-auto bg-gradient-gold rounded-full" />
              </div>

              <div className="space-y-3 p-4 bg-gradient-to-r from-russia-blue/10 to-russia-red/10 rounded-xl border border-russia-gold/20">
                <p className="text-sm text-muted-foreground font-semibold">{t('game.currentPlayer')}:</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl drop-shadow-lg glow-effect">
                    {currentPlayer.token}
                  </span>
                  <div className="text-left">
                    <p className="text-xl font-bold text-russia-gold">
                      {pname(currentPlayer)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      💰 {(currentPlayer.money / 1_000).toFixed(0)}K₽
                    </p>
                  </div>
                </div>
              </div>

              {/* Current event */}
              {gameState.currentEvent && (
                <div className="p-3 rounded-xl border border-russia-gold/40 bg-gradient-to-r from-russia-gold/10 to-russia-gold/5 text-left space-y-0.5">
                  <p className="text-xs font-bold text-russia-gold">{gameState.currentEvent.nameKey}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{gameState.currentEvent.descriptionKey}</p>
                </div>
              )}

              {/* Net worth standings */}
              <div className="space-y-1">
                {sortedStandings.map(({ p, net }, rank) => (
                  <div key={p.id} className={cn('flex items-center gap-2 text-[10px] px-2 py-0.5 rounded', p.id === currentPlayer.id && 'bg-russia-gold/10')}>
                    <span className="text-muted-foreground w-3">{rank + 1}.</span>
                    <span>{p.token}</span>
                    <span className={cn('flex-1 truncate', p.id === currentPlayer.id && 'text-russia-gold font-bold')}>{pname(p)}</span>
                    <span className="text-emerald-400 font-semibold">{(net / 1_000_000).toFixed(1)}M</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1">
                  <span className="text-russia-gold">🔄</span>
                  <span>Раунд {gameState.round}/{gameState.maxRounds}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                <div className="flex items-center gap-1">
                  <span className="text-russia-blue">⚙️</span>
                  <span>{gameState.phase}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PropertyModal cell={selectedCell} onClose={() => setSelectedCell(null)} />
    </>
  );
};
