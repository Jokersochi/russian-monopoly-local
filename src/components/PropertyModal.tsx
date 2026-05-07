import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { Cell } from '@/types/game';
import { cn } from '@/lib/utils';

interface PropertyModalProps {
  cell: Cell | null;
  onClose: () => void;
}

const HOUSE_ICONS = ['—', '🏠', '🏠🏠', '🏠🏠🏠', '🏠🏠🏠🏠', '🏨'];

export const PropertyModal = ({ cell, onClose }: PropertyModalProps) => {
  const { gameState, buyHouse, sellHouse, mortgageProperty, unmortgageProperty, cells } = useGame();
  const { t } = useLocale();

  if (!cell || !gameState) return null;

  const { players, currentPlayer: cpIdx, houses, phase } = gameState;
  const currentPlayer = players[cpIdx];
  const owner = players.find(p => p.properties.includes(cell.id));
  const isOwnedByCurrentPlayer = owner?.id === currentPlayer.id;
  const canLiquidate = phase === 'rolling' || phase === 'pre-bankruptcy';
  const houseCount = houses[cell.id] || 0;
  const isMortgaged = isOwnedByCurrentPlayer && currentPlayer.mortgaged.includes(cell.id);
  const mortgageValue = cell.price ? Math.floor(cell.price / 2) : 0;
  const redemptionCost = cell.price ? Math.floor(cell.price / 2 * 1.1) : 0;
  const houseRefund = cell.houseCost ? Math.floor(cell.houseCost / 2) : 0;
  const canMortgage = isOwnedByCurrentPlayer && canLiquidate && !isMortgaged && !!cell.price && houseCount === 0;
  const canUnmortgage = isOwnedByCurrentPlayer && canLiquidate && isMortgaged && currentPlayer.money >= redemptionCost;
  const canSellHouse = isOwnedByCurrentPlayer && canLiquidate && houseCount > 0;

  const sameColor = cell.color
    ? cells.filter(c => c.color === cell.color)
    : [];
  const ownsAll = sameColor.length > 0 && sameColor.every(c => currentPlayer.properties.includes(c.id));
  const canBuildHouse =
    isOwnedByCurrentPlayer &&
    cell.type === 'city' &&
    !!cell.houseCost &&
    ownsAll &&
    houseCount < 5 &&
    phase === 'rolling' &&
    currentPlayer.money >= cell.houseCost;

  return (
    <Dialog open={!!cell} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-sm bg-card/98 border-2 border-russia-gold/30 shadow-board">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {cell.color && (
              <span
                className="w-5 h-5 rounded-full border border-black/20 flex-shrink-0"
                style={{ backgroundColor: cell.color }}
              />
            )}
            {t(`cells.${cell.nameKey}`)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Owner */}
          <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/40 text-sm">
            <span className="text-muted-foreground">👤 Владелец</span>
            {owner ? (
              <span className="font-bold flex items-center gap-1">
                {owner.token} {owner.displayName || t(`players.${owner.nameKey}`)}
                {isMortgaged && <Badge variant="destructive" className="text-xs ml-1">{t('game.mortgaged')}</Badge>}
              </span>
            ) : (
              <Badge variant="secondary" className="text-xs">Банк</Badge>
            )}
          </div>

          {/* Price */}
          {cell.price && (
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/40 text-sm">
              <span className="text-muted-foreground">💰 Цена</span>
              <span className="font-bold text-russia-gold">{(cell.price / 1_000).toFixed(0)}K₽</span>
            </div>
          )}

          {/* Houses */}
          {cell.type === 'city' && (
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/40 text-sm">
              <span className="text-muted-foreground">🏗️ Строений</span>
              <span className="font-bold">{HOUSE_ICONS[houseCount]}</span>
            </div>
          )}

          {/* Rent ladder */}
          {cell.rent && (
            <div className="rounded-lg border border-border/40 overflow-hidden">
              <div className="bg-muted/80 px-3 py-2 text-xs font-bold text-muted-foreground">
                📊 Таблица аренды
              </div>
              <div className="divide-y divide-border/30">
                {cell.rent.map((r, i) => {
                  const label = i === 0 ? 'Базовая' : i === 5 ? '🏨 Отель' : `${i} ${i === 1 ? 'дом' : 'дома'}`;
                  const isActive = houseCount === i;
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex justify-between items-center px-3 py-1.5 text-xs',
                        isActive && 'bg-russia-gold/20 font-bold'
                      )}
                    >
                      <span className={cn('text-muted-foreground', isActive && 'text-foreground')}>
                        {label}
                      </span>
                      <span className={cn('font-semibold', isActive && 'text-russia-gold')}>
                        {(r / 1_000).toFixed(0)}K₽
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sell house */}
          {canSellHouse && (
            <Button
              onClick={() => { sellHouse(cell.id); onClose(); }}
              variant="outline"
              className="w-full border-orange-400/50 text-orange-300 hover:bg-orange-400/10 text-sm"
            >
              🏚️ Снести {houseCount === 5 ? 'отель' : 'дом'} (+{(houseRefund / 1_000).toFixed(0)}K₽)
            </Button>
          )}

          {/* Build house */}
          {isOwnedByCurrentPlayer && cell.type === 'city' && cell.houseCost && phase === 'rolling' && (
            <div className="space-y-1.5">
              {!ownsAll && (
                <p className="text-xs text-muted-foreground text-center">
                  Нужно владеть всеми объектами цвета для строительства
                </p>
              )}
              <Button
                onClick={() => { buyHouse(cell.id); onClose(); }}
                disabled={!canBuildHouse}
                className="w-full bg-gradient-gold hover:opacity-90 font-bold text-sm"
              >
                🏗️ Построить {houseCount < 4 ? 'дом' : 'отель'} ({(cell.houseCost / 1_000).toFixed(0)}K₽)
              </Button>
            </div>
          )}

          {/* Mortgage / Unmortgage */}
          {isOwnedByCurrentPlayer && phase === 'rolling' && cell.price && (
            <div className="space-y-1.5">
              {!isMortgaged ? (
                <>
                  {houseCount > 0 && (
                    <p className="text-xs text-muted-foreground text-center">
                      Снесите все дома перед залогом
                    </p>
                  )}
                  <Button
                    onClick={() => { mortgageProperty(cell.id); onClose(); }}
                    disabled={!canMortgage}
                    variant="outline"
                    className="w-full border-orange-500/50 text-orange-400 hover:bg-orange-500/10 text-sm"
                  >
                    🏦 {t('game.mortgage')} (+{(mortgageValue / 1_000).toFixed(0)}K₽)
                  </Button>
                </>
              ) : (
                <>
                  {!canUnmortgage && (
                    <p className="text-xs text-muted-foreground text-center">
                      Нужно {(redemptionCost / 1_000).toFixed(0)}K₽ для выкупа
                    </p>
                  )}
                  <Button
                    onClick={() => { unmortgageProperty(cell.id); onClose(); }}
                    disabled={!canUnmortgage}
                    variant="outline"
                    className="w-full border-green-500/50 text-green-400 hover:bg-green-500/10 text-sm"
                  >
                    🔓 {t('game.unmortgage')} (-{(redemptionCost / 1_000).toFixed(0)}K₽)
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Color group info */}
          {sameColor.length > 1 && (
            <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-xs text-muted-foreground">
              <span className="font-semibold">Группа: </span>
              {sameColor.map(c => t(`cells.${c.nameKey}`)).join(', ')}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
