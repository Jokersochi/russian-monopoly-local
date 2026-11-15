import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion';
import {
  ArrowUpRight, Building2, CircleParking, Coins, Crown, Gem,
  Landmark, LockKeyhole, Plane, Scale, Sparkles, TrainFront, Zap,
} from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { PropertyModal } from '@/components/PropertyModal';
import { Cell, Player } from '@/types/game';
import { cn } from '@/lib/utils';
import {
  BOARD_HEIGHT, BOARD_PADDING, BOARD_POSITIONS, BOARD_WIDTH, CELL_SIZE,
  getTokenCoordinates, tokenMovementPath,
} from '@/lib/boardGeometry';
import './luxury-board.css';

function getIcon(cell: Cell) {
  switch (cell.type) {
    case 'start': return <ArrowUpRight size={24} strokeWidth={2.5} />;
    case 'chance': return <Sparkles size={22} />;
    case 'trial': return <Scale size={22} />;
    case 'tax': return <Coins size={22} />;
    case 'jail': return <LockKeyhole size={22} />;
    case 'free-parking': return <CircleParking size={22} />;
    case 'go-to-jail': return <Scale size={22} />;
    case 'transport': return <Plane size={22} />;
    case 'utility': return <Zap size={22} />;
    default: return <Building2 size={22} />;
  }
}

function compactMoney(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return Math.round(value / 1_000) + 'K';
  return String(value);
}

function AnimatedToken({
  player,
  index,
  name,
}: {
  player: Player;
  index: number;
  name: string;
}) {
  const controls = useAnimationControls();
  const reducedMotion = useReducedMotion();
  const previous = useRef(player.position);
  const point = getTokenCoordinates(player.position, index);

  useEffect(() => {
    const before = previous.current;
    const after = player.position;
    previous.current = after;
    if (before === after) return;

    const path = reducedMotion ? [after] : tokenMovementPath(before, after);
    const positions = path.map(pos => getTokenCoordinates(pos, index));
    const duration = reducedMotion ? 0 : Math.min(1.65, 0.13 * path.length);

    void controls.start({
      x: positions.map(pos => pos.x),
      y: positions.map(pos => pos.y),
      scale: positions.map((_, i) => i === positions.length - 1 ? 1.16 : 1),
    }, { duration, ease: 'easeInOut' });
  }, [player.position, index, reducedMotion, controls]);

  if (player.bankrupt) return null;

  return (
    <motion.div
      className={cn('luxury-token', index % 2 === 0 ? 'luxury-token-gold' : 'luxury-token-blue')}
      initial={{ x: point.x, y: point.y, scale: 1 }}
      animate={controls}
      title={name}
      aria-label={name + ' — игровая фишка'}
    >
      <span className="luxury-token-emoji">{player.token}</span>
    </motion.div>
  );
}

/** Presentation-only board: keeps the existing game engine and saved state intact. */
export const GameBoard = () => {
  const { cells, gameState } = useGame();
  const { t } = useLocale();
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [focusedId, setFocusedId] = useState<number | null>(null);

  if (!gameState) return null;

  const { players, houses } = gameState;
  const active = players[gameState.currentPlayer];
  const playerLabel = (player: Player) =>
    player.displayName || t('players.' + player.nameKey);
  const propertyCount = players.reduce((total, p) => total + p.properties.length, 0);
  const totalCash = players.reduce((sum, p) => sum + p.money, 0);
  const selected = focusedId === null ? null : cells[focusedId];

  return (
    <>
      <div className="luxury-board-frame" style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}>
        <div className="luxury-board-sheen" aria-hidden="true" />
        <div
          className="luxury-board-grid"
          style={{
            left: BOARD_PADDING,
            top: BOARD_PADDING,
            gridTemplateColumns: 'repeat(14, ' + CELL_SIZE + 'px)',
            gridTemplateRows: 'repeat(8, ' + CELL_SIZE + 'px)',
          }}
        >
          {cells.map((cell, index) => {
            const point = BOARD_POSITIONS[index];
            if (!point) return null;
            const owner = players.find(p => p.properties.includes(cell.id));
            const ownedByActive = owner?.id === active.id;
            const mortgaged = Boolean(owner?.mortgaged.includes(cell.id));
            const buildingCount = houses[cell.id] || 0;
            const isActive = active.position === cell.id;
            const name = t('cells.' + cell.nameKey);
            const rent = cell.rent?.[Math.min(buildingCount, cell.rent.length - 1)];
            const isCorner = point.col === 0 || point.col === 13
              ? point.row === 0 || point.row === 7 : false;

            return (
              <motion.button
                key={cell.id}
                type="button"
                className={cn(
                  'luxury-cell',
                  isCorner && 'luxury-cell-corner',
                  isActive && 'luxury-cell-active',
                  owner && 'luxury-cell-owned',
                  ownedByActive && 'luxury-cell-self',
                  mortgaged && 'luxury-cell-mortgaged',
                  focusedId === cell.id && 'luxury-cell-focused',
                )}
                style={{ gridColumn: point.col + 1, gridRow: point.row + 1 }}
                onClick={() => {
                  setFocusedId(cell.id);
                  if (cell.price) setSelectedCell(cell);
                }}
                whileHover={{ scale: 1.075, y: -3, zIndex: 15 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 340, damping: 25 }}
                title={name + (cell.price ? ' · ' + compactMoney(cell.price) + ' ₽' : '')}
                aria-label={name + (cell.price ? ', цена ' + cell.price + ' рублей' : '')}
                aria-pressed={focusedId === cell.id}
              >
                {cell.color && (
                  <span
                    className="luxury-cell-band"
                    style={{ background: cell.color, boxShadow: '0 0 16px ' + cell.color + '65' }}
                  />
                )}
                <span className="luxury-cell-number">{String(cell.id).padStart(2, '0')}</span>
                <span className="luxury-cell-icon">{getIcon(cell)}</span>
                <span className="luxury-cell-name">{name}</span>
                <span className="luxury-cell-price">
                  {cell.price ? compactMoney(cell.price) + ' ₽' : cell.type === 'start' ? '+2M ₽' : '◆'}
                </span>
                {owner && (
                  <span className={cn('luxury-owner-dot', ownedByActive ? 'luxury-owner-self' : 'luxury-owner-other')}
                    title={'Владелец: ' + playerLabel(owner)}>
                    {owner.token}
                  </span>
                )}
                {buildingCount > 0 && (
                  <span className="luxury-buildings" title={buildingCount === 5 ? 'Отель' : 'Дома'}>
                    {buildingCount === 5 ? '◆◆' : '◆'.repeat(buildingCount)}
                  </span>
                )}
                {mortgaged && <span className="luxury-mortgage">ЗАЛОГ</span>}
                {rent !== undefined && owner && <span className="luxury-rent">{compactMoney(rent)}</span>}
              </motion.button>
            );
          })}

          <section className="luxury-board-center" aria-label="Центр игрового поля"
            style={{ gridColumn: '2 / span 12', gridRow: '2 / span 6' }}>
            <div className="luxury-corner-ornament top-left" />
            <div className="luxury-corner-ornament top-right" />
            <div className="luxury-corner-ornament bottom-left" />
            <div className="luxury-corner-ornament bottom-right" />

            <motion.div
              className="luxury-center-content"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="luxury-edition"><Gem size={14} /> RUSSIAN EMPIRE · GOLD EDITION <Gem size={14} /></div>
              <div className="luxury-emblem"><Crown size={35} strokeWidth={1.4} /></div>
              <h2 className="luxury-title">МОНОПОЛИЯ</h2>
              <p className="luxury-center-subtitle">ИМПЕРИЯ КАПИТАЛА</p>
              <div className="luxury-title-line" />
              <div className="luxury-current-label">СЕЙЧАС ХОДИТ</div>
              <AnimatePresence mode="wait">
                <motion.div className="luxury-current-player" key={active.id}
                  initial={{ opacity: 0, y: 10, filter: 'blur(7px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}>
                  <span className="luxury-current-token">{active.token}</span>
                  <span>{playerLabel(active)}</span>
                </motion.div>
              </AnimatePresence>
              <div className="luxury-center-metrics">
                <div><small>РАУНД</small><strong>{gameState.round} / {gameState.maxRounds}</strong></div>
                <div><small>АКТИВЫ</small><strong>{propertyCount} / 28</strong></div>
                <div><small>КАПИТАЛ ИГРОКОВ</small><strong>{compactMoney(totalCash)} ₽</strong></div>
              </div>
              {selected && (
                <motion.div className="luxury-selection" key={selected.id}
                  initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                  <Landmark size={15} /> Выбрано: {t('cells.' + selected.nameKey)}
                </motion.div>
              )}
            </motion.div>
          </section>
        </div>

        <div className="luxury-token-layer" aria-hidden="false">
          {players.map((player, index) => (
            <AnimatedToken key={player.id} player={player} index={index} name={playerLabel(player)} />
          ))}
        </div>
      </div>
      <PropertyModal cell={selectedCell} onClose={() => setSelectedCell(null)} />
    </>
  );
};
