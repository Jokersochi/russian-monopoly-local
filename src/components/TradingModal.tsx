import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { TradeOffer } from '@/types/game';
import { cn } from '@/lib/utils';

interface TradingModalProps {
  open: boolean;
  onClose: () => void;
}

interface TradeConfig {
  targetPlayer: number | null;
  offeredProperties: number[];
  requestedProperties: number[];
  offeredMoney: number;
  requestedMoney: number;
}

const EMPTY_CONFIG: TradeConfig = {
  targetPlayer: null,
  offeredProperties: [],
  requestedProperties: [],
  offeredMoney: 0,
  requestedMoney: 0,
};

export const TradingModal = ({ open, onClose }: TradingModalProps) => {
  const { gameState, executeTrade, cells } = useGame();
  const { t } = useLocale();

  const [view, setView] = useState<'propose' | 'review'>('propose');
  const [config, setConfig] = useState<TradeConfig>(EMPTY_CONFIG);
  const [offerMoneyStr, setOfferMoneyStr] = useState('');
  const [requestMoneyStr, setRequestMoneyStr] = useState('');

  if (!gameState) return null;

  const { players, currentPlayer: cpIdx } = gameState;
  const currentPlayer = players[cpIdx];
  const otherActivePlayers = players.filter((p, i) => i !== cpIdx && !p.bankrupt);
  const targetPlayer = config.targetPlayer !== null ? players[config.targetPlayer] : null;

  const pname = (p: typeof players[0]) => p.displayName || t(`players.${p.nameKey}`);

  const handleClose = () => {
    setView('propose');
    setConfig(EMPTY_CONFIG);
    setOfferMoneyStr('');
    setRequestMoneyStr('');
    onClose();
  };

  const toggleProp = (propId: number, side: 'offer' | 'request') => {
    if (side === 'offer') {
      setConfig(c => ({
        ...c,
        offeredProperties: c.offeredProperties.includes(propId)
          ? c.offeredProperties.filter(id => id !== propId)
          : [...c.offeredProperties, propId],
      }));
    } else {
      setConfig(c => ({
        ...c,
        requestedProperties: c.requestedProperties.includes(propId)
          ? c.requestedProperties.filter(id => id !== propId)
          : [...c.requestedProperties, propId],
      }));
    }
  };

  const canPropose =
    config.targetPlayer !== null &&
    (config.offeredProperties.length > 0 || config.offeredMoney > 0 ||
      config.requestedProperties.length > 0 || config.requestedMoney > 0);

  const handleAccept = () => {
    if (config.targetPlayer === null) return;
    const offer: TradeOffer = {
      fromPlayer: cpIdx,
      toPlayer: config.targetPlayer,
      offeredProperties: config.offeredProperties,
      requestedProperties: config.requestedProperties,
      offeredMoney: config.offeredMoney,
      requestedMoney: config.requestedMoney,
    };
    executeTrade(offer);
    handleClose();
  };

  // ---- Review view ----
  if (view === 'review' && targetPlayer) {
    return (
      <Dialog open={open} onOpenChange={o => !o && handleClose()}>
        <DialogContent className="max-w-md bg-card/98 border-2 border-russia-gold/30">
          <DialogHeader>
            <DialogTitle>🤝 Предложение сделки</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground p-2 bg-muted/30 rounded-lg">
              {currentPlayer.token} <strong>{pname(currentPlayer)}</strong>
              {' → '}
              {targetPlayer.token} <strong>{pname(targetPlayer)}</strong>
            </div>

            <div className="rounded-lg border border-russia-gold/30 overflow-hidden">
              <div className="bg-russia-gold/10 px-3 py-2 text-xs font-bold">
                {pname(currentPlayer)} отдаёт:
              </div>
              <div className="p-2 space-y-1 min-h-[32px]">
                {config.offeredProperties.map(id => {
                  const c = cells[id];
                  return (
                    <div key={id} className="flex items-center gap-2 text-xs p-1 bg-muted/30 rounded">
                      {c.color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />}
                      {t(`cells.${c.nameKey}`)}
                    </div>
                  );
                })}
                {config.offeredMoney > 0 && (
                  <div className="text-xs p-1 text-russia-gold font-bold">
                    💰 {config.offeredMoney.toLocaleString('ru-RU')}₽
                  </div>
                )}
                {config.offeredProperties.length === 0 && config.offeredMoney === 0 && (
                  <div className="text-xs text-muted-foreground italic px-1">Ничего</div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-russia-blue/30 overflow-hidden">
              <div className="bg-russia-blue/10 px-3 py-2 text-xs font-bold">
                {pname(targetPlayer)} отдаёт:
              </div>
              <div className="p-2 space-y-1 min-h-[32px]">
                {config.requestedProperties.map(id => {
                  const c = cells[id];
                  return (
                    <div key={id} className="flex items-center gap-2 text-xs p-1 bg-muted/30 rounded">
                      {c.color && <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />}
                      {t(`cells.${c.nameKey}`)}
                    </div>
                  );
                })}
                {config.requestedMoney > 0 && (
                  <div className="text-xs p-1 text-russia-blue font-bold">
                    💰 {config.requestedMoney.toLocaleString('ru-RU')}₽
                  </div>
                )}
                {config.requestedProperties.length === 0 && config.requestedMoney === 0 && (
                  <div className="text-xs text-muted-foreground italic px-1">Ничего</div>
                )}
              </div>
            </div>

            <p className="text-center text-sm font-semibold text-muted-foreground">
              👆 Передайте устройство игроку <strong>{pname(targetPlayer)}</strong>
            </p>

            <div className="flex gap-2">
              <Button
                onClick={handleAccept}
                className="flex-1 h-11 bg-gradient-gold hover:opacity-90 font-bold"
              >
                ✅ Принять
              </Button>
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1 h-11 border-russia-red/50 text-russia-red hover:bg-russia-red/10"
              >
                ❌ Отклонить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ---- Propose view ----
  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent className="max-w-md bg-card/98 border-2 border-russia-gold/30 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>🤝 Предложить сделку</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Target player */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Выберите игрока:</p>
            <div className="flex gap-2 flex-wrap">
              {otherActivePlayers.map((p) => {
                const pIdx = players.indexOf(p);
                return (
                  <Button
                    key={p.id}
                    size="sm"
                    variant={config.targetPlayer === pIdx ? 'default' : 'outline'}
                    onClick={() => setConfig(c => ({ ...c, targetPlayer: pIdx, requestedProperties: [] }))}
                    className={cn(config.targetPlayer === pIdx && 'bg-russia-blue text-white shadow-strong')}
                  >
                    {p.token} {pname(p)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Your properties to offer */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Вы отдаёте (владения):</p>
            {currentPlayer.properties.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">У вас нет владений</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {currentPlayer.properties.map(id => {
                  const c = cells[id];
                  const selected = config.offeredProperties.includes(id);
                  return (
                    <button
                      key={id}
                      onClick={() => toggleProp(id, 'offer')}
                      className={cn(
                        'flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all',
                        selected
                          ? 'bg-russia-gold/20 border-russia-gold text-russia-gold font-bold'
                          : 'bg-muted/40 border-border hover:border-russia-gold/50'
                      )}
                    >
                      {c.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />}
                      {t(`cells.${c.nameKey}`)}
                      {selected && ' ✓'}
                    </button>
                  );
                })}
              </div>
            )}
            <Input
              type="number"
              placeholder="Деньги от вас (₽)"
              value={offerMoneyStr}
              onChange={e => {
                setOfferMoneyStr(e.target.value);
                setConfig(c => ({ ...c, offeredMoney: parseInt(e.target.value) || 0 }));
              }}
              className="h-8 text-sm mt-2"
            />
          </div>

          {/* Target's properties to request */}
          {targetPlayer && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                Вы получаете (владения {pname(targetPlayer)}):
              </p>
              {targetPlayer.properties.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Нет владений</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {targetPlayer.properties.map(id => {
                    const c = cells[id];
                    const selected = config.requestedProperties.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => toggleProp(id, 'request')}
                        className={cn(
                          'flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-all',
                          selected
                            ? 'bg-russia-blue/20 border-russia-blue text-russia-blue font-bold'
                            : 'bg-muted/40 border-border hover:border-russia-blue/50'
                        )}
                      >
                        {c.color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />}
                        {t(`cells.${c.nameKey}`)}
                        {selected && ' ✓'}
                      </button>
                    );
                  })}
                </div>
              )}
              <Input
                type="number"
                placeholder={`Деньги от ${pname(targetPlayer)} (₽)`}
                value={requestMoneyStr}
                onChange={e => {
                  setRequestMoneyStr(e.target.value);
                  setConfig(c => ({ ...c, requestedMoney: parseInt(e.target.value) || 0 }));
                }}
                className="h-8 text-sm mt-2"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <Button
              onClick={() => setView('review')}
              disabled={!canPropose}
              className="flex-1 h-11 bg-gradient-russian hover:opacity-90 font-bold"
            >
              📋 Предложить
            </Button>
            <Button onClick={handleClose} variant="outline" className="flex-1 h-11">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
