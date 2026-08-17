import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { PropertyModal } from '@/components/PropertyModal';
import { Cell } from '@/types/game';
import { cn } from '@/lib/utils';

const SPECIAL_CELL_ICONS: Partial<Record<Cell['type'], string>> = {
  start: '▶',
  chance: '?',
  trial: '!',
  tax: '₽',
  jail: '🔒',
  'free-parking': 'P',
  'go-to-jail': '⚖',
  transport: '✈',
  utility: '⚡',
};

export const GameBoard = () => {
  const { cells, gameState } = useGame();
  const { t } = useLocale();
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [justLandedIds, setJustLandedIds] = useState<Set<number>>(new Set());
  const prevPositions = useRef<Record<number, number>>({});

  const positionSignature = gameState?.players
    .map(player => `${player.id}:${player.position}`)
    .join(',') ?? '';

  useEffect(() => {
    if (!gameState) return;

    const movedIds: number[] = [];
    gameState.players.forEach(player => {
      const previousPosition = prevPositions.current[player.id];
      if (previousPosition !== undefined && previousPosition !== player.position) {
        movedIds.push(player.id);
      }
      prevPositions.current[player.id] = player.position;
    });

    if (movedIds.length === 0) return;

    setJustLandedIds(new Set(movedIds));
    const timer = window.setTimeout(() => setJustLandedIds(new Set()), 700);
    return () => window.clearTimeout(timer);
  }, [positionSignature, gameState]);

  if (!gameState) return null;

  const { players, currentPlayer: currentPlayerIndex, houses } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const playerName = (player: typeof players[number]) =>
    player.displayName || t(`players.${player.nameKey}`);

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

  const getOwner = (cellId: number) => players.find(player => player.properties.includes(cellId));
  const getPlayersOnCell = (cellId: number) => players.filter(player => player.position === cellId);

  return (
    <>
      <div
        className="relative rounded-[28px] shadow-board p-8 border-8 border-russia-gold/80 backdrop-blur-sm overflow-hidden"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(249,242,219,0.98) 0%, rgba(226,219,187,0.98) 47%, transparent 48%), linear-gradient(135deg, #3d2417 0%, #84562f 28%, #4a2d1c 55%, #9a6a3b 76%, #321e14 100%)',
          boxShadow: '0 28px 80px rgba(35,20,10,0.38), inset 0 0 0 2px rgba(255,226,156,0.18)',
        }}
      >
        <div className="absolute inset-3 rounded-2xl border border-white/10 pointer-events-none" />
        <div className="absolute top-3 left-3 w-14 h-14 border-t-2 border-l-2 border-russia-gold/70 rounded-tl-2xl pointer-events-none" />
        <div className="absolute top-3 right-3 w-14 h-14 border-t-2 border-r-2 border-russia-gold/70 rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-3 left-3 w-14 h-14 border-b-2 border-l-2 border-russia-gold/70 rounded-bl-2xl pointer-events-none" />
        <div className="absolute bottom-3 right-3 w-14 h-14 border-b-2 border-r-2 border-russia-gold/70 rounded-br-2xl pointer-events-none" />

        <div className="relative" style={{ width: '902px', height: '902px' }}>
          {cells.map(cell => {
            const owner = getOwner(cell.id);
            const playersHere = getPlayersOnCell(cell.id);
            const houseCount = houses[cell.id] || 0;
            const isCurrentPlayerHere = currentPlayer.position === cell.id;
            const isOwnedByCurrentPlayer = owner?.id === currentPlayer.id;
            const isUnowned = !owner && !!cell.price;
            const isOtherPlayerOwned = owner && owner.id !== currentPlayer.id;
            const isMortgaged = !!owner?.mortgaged.includes(cell.id);
            const isInteractive = !!cell.price || cell.type === 'transport' || cell.type === 'utility';
            const specialIcon = SPECIAL_CELL_ICONS[cell.type];
            const rentIndex = Math.min(houseCount, Math.max(0, (cell.rent?.length ?? 1) - 1));
            const displayedRent = cell.rent?.[rentIndex];

            const cellStyle = {
              ...getCellStyle(cell.position),
              ...(cell.color && { borderTopColor: cell.color }),
            };

            const openCell = () => {
              if (isInteractive) setSelectedCell(cell);
            };

            const details = [
              t(`cells.${cell.nameKey}`),
              cell.price ? `Цена: ${cell.price.toLocaleString('ru-RU')}₽` : null,
              displayedRent ? `Аренда: ${displayedRent.toLocaleString('ru-RU')}₽` : null,
              owner ? `Владелец: ${playerName(owner)}` : null,
              isMortgaged ? 'Заложено' : null,
            ].filter(Boolean).join(' · ');

            return (
              <div
                key={cell.id}
                style={cellStyle}
                onClick={openCell}
                onKeyDown={event => {
                  if (!isInteractive) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openCell();
                  }
                }}
                role={isInteractive ? 'button' : undefined}
                tabIndex={isInteractive ? 0 : undefined}
                aria-label={isInteractive ? details : undefined}
                title={details}
                className={cn(
                  'border-2 rounded-lg bg-[#f8f2df]/95 text-[#241d16] backdrop-blur-sm flex flex-col items-center justify-center p-1.5 text-center transition-all duration-200 hover:z-10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-russia-blue/60',
                  isInteractive
                    ? 'cursor-pointer hover:scale-110 hover:shadow-strong'
                    : 'cursor-default',
                  cell.color && 'border-t-[10px]',
                  isCurrentPlayerHere && 'ring-4 ring-russia-blue shadow-[0_0_16px_rgba(0,100,255,0.55)] scale-105 z-20',
                  isOwnedByCurrentPlayer && !isCurrentPlayerHere && 'ring-2 ring-russia-gold/80 bg-[#fff8db]',
                  isOtherPlayerOwned && !isCurrentPlayerHere && 'ring-2 ring-russia-red/45',
                  isUnowned && !isCurrentPlayerHere && 'border-board-green/50 hover:border-board-green',
                  !owner && !cell.price && 'border-[#5e594c]/35',
                  isMortgaged && 'opacity-60 grayscale-[0.35]'
                )}
              >
                {specialIcon && !cell.color && (
                  <div className="text-[12px] font-black leading-none mb-0.5 opacity-70">
                    {specialIcon}
                  </div>
                )}

                <div className="text-[9px] font-extrabold leading-tight overflow-hidden max-h-[28px]">
                  {t(`cells.${cell.nameKey}`)}
                </div>

                {cell.price && (
                  <div className="text-[8px] text-[#8a6200] font-black mt-0.5">
                    {(cell.price / 1_000).toFixed(0)}K₽
                  </div>
                )}

                {houseCount > 0 && (
                  <div
                    className="text-[8px] leading-none mt-0.5"
                    title={houseCount < 5 ? `${houseCount} дом(а)` : 'Отель'}
                  >
                    {houseCount < 5 ? '🏠'.repeat(houseCount) : '🏨'}
                  </div>
                )}

                {owner && (
                  <div className="flex items-center gap-0.5 mt-0.5" title={playerName(owner)}>
                    <span className="text-[9px]">{owner.token}</span>
                    {isMortgaged && (
                      <span className="rounded bg-orange-700 px-0.5 text-[6px] font-black text-white">ЗАЛОГ</span>
                    )}
                  </div>
                )}

                {playersHere.length > 0 && (
                  <div className="absolute -bottom-3 flex gap-0.5 bg-[#f8f2df]/95 rounded-full px-1.5 py-0.5 shadow-md border border-russia-gold/40 z-30">
                    {playersHere.map(player => (
                      <span
                        key={player.id}
                        className={cn(
                          'text-base drop-shadow transition-transform',
                          justLandedIds.has(player.id) && 'animate-bounce'
                        )}
                        title={playerName(player)}
                      >
                        {player.token}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[438px] h-[438px] rounded-[28px] border-4 border-[#8d6c36]/25 flex items-center justify-center overflow-hidden shadow-[inset_0_0_55px_rgba(92,65,24,0.12),0_18px_45px_rgba(74,43,18,0.18)] bg-[#f5efd9]/95">
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.9), transparent 40%), linear-gradient(135deg, rgba(112,141,103,0.18), rgba(190,153,91,0.12))' }} />

            <div className="relative text-center space-y-4 p-8 w-full">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#7a6337] font-black mb-2">
                  Economic board game
                </p>
                <h2 className="text-5xl font-black bg-gradient-russian bg-clip-text text-transparent drop-shadow-sm mb-2">
                  {t('game.title')}
                </h2>
                <div className="h-1 w-36 mx-auto bg-gradient-gold rounded-full" />
              </div>

              <div className="space-y-3 p-4 bg-white/55 rounded-2xl border border-[#8d6c36]/20 shadow-sm">
                <p className="text-xs text-[#6e6656] font-bold uppercase tracking-wider">
                  {t('game.currentPlayer')}
                </p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl drop-shadow-lg glow-effect">{currentPlayer.token}</span>
                  <div className="text-left min-w-0">
                    <p className="text-xl font-black text-[#8a6200] truncate max-w-[240px]">
                      {playerName(currentPlayer)}
                    </p>
                    <p className="text-sm text-[#655e52] font-semibold">
                      {(currentPlayer.money / 1_000_000).toFixed(2)}M₽ · {currentPlayer.properties.length} влад.
                    </p>
                  </div>
                </div>
              </div>

              {gameState.currentEvent && (
                <div className="p-3 rounded-xl border border-[#b98c33]/35 bg-[#fff7d8]/75 text-left space-y-0.5">
                  <p className="text-xs font-black text-[#80600c]">{gameState.currentEvent.nameKey}</p>
                  <p className="text-[10px] text-[#665d4e] leading-tight">{gameState.currentEvent.descriptionKey}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {[...players]
                  .map(player => {
                    const propertyValue = cells
                      .filter(cell => player.properties.includes(cell.id))
                      .reduce((sum, cell) => sum + (cell.price || 0), 0);
                    const houseValue = cells
                      .filter(cell => player.properties.includes(cell.id))
                      .reduce(
                        (sum, cell) => sum + (gameState.houses[cell.id] || 0) * (cell.houseCost || 0),
                        0
                      );
                    return { player, netWorth: player.money + propertyValue + houseValue };
                  })
                  .sort((a, b) => b.netWorth - a.netWorth)
                  .map(({ player, netWorth }, rank) => (
                    <div
                      key={player.id}
                      className={cn(
                        'flex items-center gap-1.5 text-[9px] px-2 py-1 rounded-lg bg-white/45 border border-[#8d6c36]/10',
                        player.id === currentPlayer.id && 'bg-[#fff3bd] border-russia-gold/30'
                      )}
                    >
                      <span className="text-[#766d5d] w-3">{rank + 1}.</span>
                      <span>{player.token}</span>
                      <span className="flex-1 truncate font-semibold">{playerName(player)}</span>
                      <span className="text-emerald-700 font-black">{(netWorth / 1_000_000).toFixed(1)}M</span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-[#6d6658] pt-1 font-semibold">
                <span>Раунд {gameState.round}/{gameState.maxRounds}</span>
                <span className="w-1 h-1 rounded-full bg-[#82775e]" />
                <span className="capitalize">{gameState.phase}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PropertyModal cell={selectedCell} onClose={() => setSelectedCell(null)} />
    </>
  );
};
