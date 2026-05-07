import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { TradingModal } from '@/components/TradingModal';
import { PropertyModal } from '@/components/PropertyModal';
import { ContractsModal } from '@/components/ContractsModal';
import { BOARD_CELLS } from '@/data/board';
import { Cell } from '@/types/game';

export const ActionPanel = () => {
  const {
    gameState,
    buyProperty,
    passProperty,
    endTurn,
    placeBid,
    passBid,
    payBail,
    useJailCard,
    dismissCard,
    initGame,
    resetGame,
    confirmBankruptcy,
    cells,
  } = useGame();
  const { t } = useLocale();
  const [bidAmount, setBidAmount] = useState('');
  const [tradeOpen, setTradeOpen] = useState(false);
  const [contractsOpen, setContractsOpen] = useState(false);
  const [inspectCell, setInspectCell] = useState<Cell | null>(null);

  const pname = (p: typeof gameState.players[0]) =>
    p.displayName || t(`players.${p.nameKey}`);

  if (!gameState) return null;

  const { phase, players, currentPlayer: cpIdx, auctionState, currentCard, dice } = gameState;
  const currentPlayer = players[cpIdx];
  const currentCell = cells[currentPlayer.position];

  const canBuy =
    phase === 'landed' &&
    currentCell.price &&
    !players.some(p => p.properties.includes(currentCell.id)) &&
    currentPlayer.money >= (currentCell.price || 0);

  const canPass = phase === 'landed' && !!currentCell.price;

  // ---- GAME OVER ----
  if (phase === 'game-over') {
    const allPlayers = gameState.players;
    const winner = allPlayers.length === 1
      ? allPlayers[0]
      : [...allPlayers].sort((a, b) => b.money - a.money)[0];

    return (
      <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-gold/40">
        <div className="p-5 text-center space-y-4">
          <div className="text-5xl">🏆</div>
          <h3 className="text-2xl font-bold text-russia-gold">{t('game.gameOver')}</h3>
          {winner && (
            <div className="p-4 bg-gradient-gold/20 rounded-lg border border-russia-gold/30">
              <p className="text-lg font-bold">{t('game.winner')}: {winner.token} {pname(winner)}</p>
              <p className="text-russia-gold text-xl font-bold mt-1">
                💰 {(winner.money / 1_000_000).toFixed(2)}M₽
              </p>
            </div>
          )}

          {/* Final standings */}
          <div className="space-y-1 text-sm">
            {[...allPlayers].sort((a, b) => b.money - a.money).map((p, i) => (
              <div key={p.id} className="flex justify-between items-center p-2 bg-card/50 rounded border border-border/30">
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground w-4">{i + 1}.</span>
                  {p.token} {pname(p)}
                </span>
                <span className="font-bold text-russia-gold">{(p.money / 1_000).toFixed(0)}K₽</span>
              </div>
            ))}
          </div>

          {/* Statistics table */}
          <div className="rounded-lg border border-border/40 overflow-hidden text-xs">
            <div className="bg-muted/80 px-3 py-2 font-bold text-muted-foreground text-left">
              📊 Статистика
            </div>
            <div className="divide-y divide-border/30">
              <div className="grid grid-cols-4 px-2 py-1.5 text-muted-foreground font-semibold bg-muted/40">
                <span>Игрок</span>
                <span className="text-center">Куплено</span>
                <span className="text-center text-board-green">Получено</span>
                <span className="text-center text-russia-red">Уплачено</span>
              </div>
              {[...allPlayers].sort((a, b) => b.money - a.money).map(p => (
                <div key={p.id} className="grid grid-cols-4 px-2 py-1.5">
                  <span className="truncate">{p.token} {pname(p)}</span>
                  <span className="text-center">{p.stats?.propertiesBought ?? 0}</span>
                  <span className="text-center text-board-green">
                    {((p.stats?.rentCollected ?? 0) / 1_000).toFixed(0)}K
                  </span>
                  <span className="text-center text-russia-red">
                    {((p.stats?.rentPaid ?? 0) / 1_000).toFixed(0)}K
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={() => resetGame()}
            className="w-full h-12 bg-gradient-russian hover:opacity-90 font-bold"
          >
            🔄 {t('game.newGame')}
          </Button>
        </div>
      </Card>
    );
  }

  // ---- PRE-BANKRUPTCY ----
  if (phase === 'pre-bankruptcy') {
    const debt = gameState.bankruptcyDebt ?? (currentPlayer.money < 0 ? -currentPlayer.money : 0);
    const creditorIdx = gameState.bankruptcyCreditor;
    const creditor = creditorIdx != null ? players[creditorIdx] : null;
    const canCover = currentPlayer.money >= 0;
    const ownedCells = cells.filter(c => currentPlayer.properties.includes(c.id));

    return (
      <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-red/50">
        <div className="p-4 border-b border-russia-red/30 flex items-center gap-2">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-lg font-bold text-russia-red">Финансовый кризис</h3>
            <p className="text-xs text-muted-foreground">
              {currentPlayer.token} {pname(currentPlayer)}
            </p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Debt info */}
          <div className="p-3 rounded-lg bg-russia-red/10 border border-russia-red/30 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Баланс:</span>
              <span className={`font-bold ${currentPlayer.money < 0 ? 'text-russia-red' : 'text-board-green'}`}>
                {(currentPlayer.money / 1_000).toFixed(0)}K₽
              </span>
            </div>
            {debt > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Долг:</span>
                <span className="font-bold text-russia-red">{(debt / 1_000).toFixed(0)}K₽</span>
              </div>
            )}
            {creditor && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Кредитор:</span>
                <span className="font-bold">{creditor.token} {pname(creditor)}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Заложите или продайте имущество, чтобы покрыть долг
          </p>

          {/* Owned properties for inspection/liquidation */}
          {ownedCells.length > 0 && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {ownedCells.map(c => (
                <button
                  key={c.id}
                  onClick={() => setInspectCell(c)}
                  className="w-full flex items-center justify-between p-2 rounded border border-border/40 hover:border-russia-gold/50 hover:bg-russia-gold/5 transition-colors text-xs text-left"
                >
                  <span className="flex items-center gap-1.5">
                    {c.color && (
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-black/20"
                        style={{ backgroundColor: c.color }}
                      />
                    )}
                    <span className="truncate">{t(`cells.${c.nameKey}`)}</span>
                    {currentPlayer.mortgaged.includes(c.id) && (
                      <span className="text-orange-400 ml-1">[залог]</span>
                    )}
                  </span>
                  {c.price && (
                    <span className="text-russia-gold font-semibold ml-2 flex-shrink-0">
                      {(c.price / 2 / 1_000).toFixed(0)}K↑
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Resolve / Bankruptcy buttons */}
          <Button
            onClick={endTurn}
            disabled={!canCover}
            className="w-full h-11 bg-gradient-gold hover:opacity-90 font-bold text-sm"
          >
            ✅ Долг погашен — продолжить
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-10 border-russia-red/50 text-russia-red hover:bg-russia-red/10 text-sm"
              >
                🏳️ Объявить банкротство
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Подтвердить банкротство?</AlertDialogTitle>
                <AlertDialogDescription>
                  {pname(currentPlayer)} выбывает из игры. Всё имущество передаётся{' '}
                  {creditor ? `${creditor.token} ${pname(creditor)}` : 'банку'}.
                  Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmBankruptcy}
                  className="bg-russia-red hover:bg-russia-red/80"
                >
                  Объявить банкротство
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <PropertyModal cell={inspectCell} onClose={() => setInspectCell(null)} />
      </Card>
    );
  }

  // ---- JAIL OPTIONS ----
  if (phase === 'jail') {
    return (
      <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-red/30">
        <div className="p-4 border-b border-russia-red/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>🔒</span> Тюрьма
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="text-center p-3 bg-russia-red/10 rounded-lg border border-russia-red/20">
            <p className="text-sm text-muted-foreground">Ходов в тюрьме:</p>
            <p className="text-2xl font-bold text-russia-red">{currentPlayer.jailTurns}/3</p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentPlayer.token} {pname(currentPlayer)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Бросьте кубики на дубль, заплатите залог или используйте карту
          </p>
          <Button
            onClick={payBail}
            disabled={currentPlayer.money < 500_000}
            className="w-full h-12 bg-gradient-gold hover:opacity-90 font-bold"
          >
            💰 Заплатить залог (500K₽)
          </Button>
          {currentPlayer.getOutOfJailCards > 0 && (
            <Button
              onClick={useJailCard}
              variant="outline"
              className="w-full h-10 border-2 border-russia-gold/50 hover:bg-russia-gold/10"
            >
              🃏 Карта освобождения (есть {currentPlayer.getOutOfJailCards})
            </Button>
          )}
          <p className="text-xs text-center text-muted-foreground">
            Или бросьте кубики на дубль ↑
          </p>
        </div>
      </Card>
    );
  }

  // ---- PAYING RENT ----
  if (phase === 'paying-rent') {
    const ownerIdx = players.findIndex(p => p.properties.includes(currentCell.id));
    const owner = ownerIdx >= 0 ? players[ownerIdx] : null;
    const rent = gameState.lastRentPaid ?? 0;

    return (
      <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-red/30">
        <div className="p-4 border-b border-russia-red/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>💸</span> Аренда
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="p-3 bg-russia-red/10 rounded-lg border border-russia-red/20 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>📍 Клетка:</span>
              <span className="font-bold">{t(`cells.${currentCell.nameKey}`)}</span>
            </div>
            <div className="flex justify-between">
              <span>🏠 Владелец:</span>
              <span className="font-bold">{owner ? `${owner.token} ${pname(owner)}` : '—'}</span>
            </div>
            <div className="flex justify-between text-base">
              <span>💰 Списано:</span>
              <span className="font-bold text-russia-red">{rent.toLocaleString('ru-RU')}₽</span>
            </div>
          </div>
          <Button
            onClick={endTurn}
            className="w-full h-12 bg-gradient-russian hover:opacity-90 font-bold"
          >
            ✅ Продолжить
          </Button>
        </div>
      </Card>
    );
  }

  // ---- CARD DRAW ----
  if (phase === 'card-draw' && currentCard) {
    const isBonus = currentCard.type === 'bonus';
    const isSpecial = currentCard.type === 'special';
    return (
      <Card className={`shadow-board backdrop-blur-sm bg-card/95 border-2 ${isBonus || isSpecial ? 'border-russia-gold/40' : 'border-russia-red/30'}`}>
        <div className={`p-4 border-b ${isBonus || isSpecial ? 'border-russia-gold/30' : 'border-russia-red/30'}`}>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>{isBonus || isSpecial ? '🃏' : '⚖️'}</span>
            {BOARD_CELLS[currentPlayer.position].type === 'chance' ? 'Шанс' : 'Испытание'}
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className={`p-4 rounded-lg border text-center ${isBonus || isSpecial ? 'bg-russia-gold/10 border-russia-gold/30' : 'bg-russia-red/10 border-russia-red/30'}`}>
            <p className="text-sm font-medium">{t(`cards.${currentCard.textKey}`)}</p>
          </div>
          <Button
            onClick={dismissCard}
            className={`w-full h-12 font-bold ${isBonus || isSpecial ? 'bg-gradient-gold' : 'bg-gradient-russian'} hover:opacity-90`}
          >
            ✅ Принять
          </Button>
        </div>
      </Card>
    );
  }

  // ---- AUCTION ----
  if (phase === 'auction' && auctionState) {
    const cell = cells[auctionState.cellId];
    const bidder = players[auctionState.currentBidder];
    const minBid = auctionState.currentBid + 1;

    return (
      <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-blue/30">
        <div className="p-4 border-b border-russia-blue/30">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span>🔨</span> Аукцион
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="p-3 bg-russia-blue/10 rounded-lg border border-russia-blue/20 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>🏛️ Лот:</span>
              <span className="font-bold">{t(`cells.${cell.nameKey}`)}</span>
            </div>
            {cell.price && (
              <div className="flex justify-between">
                <span>💲 Цена прайс:</span>
                <span>{(cell.price / 1_000).toFixed(0)}K₽</span>
              </div>
            )}
            <div className="flex justify-between text-base">
              <span>📈 Текущая ставка:</span>
              <span className="font-bold text-russia-gold">
                {auctionState.currentBid > 0 ? `${auctionState.currentBid.toLocaleString('ru-RU')}₽` : '—'}
              </span>
            </div>
            {auctionState.highBidder !== null && (
              <div className="flex justify-between">
                <span>🥇 Лидер:</span>
                <span className="font-bold">
                  {players[auctionState.highBidder]?.token}{' '}
                  {players[auctionState.highBidder] ? pname(players[auctionState.highBidder]) : ''}
                </span>
              </div>
            )}
          </div>

          <div className="p-3 bg-card/50 rounded-lg border border-russia-gold/20">
            <p className="text-xs text-muted-foreground mb-1">Ход игрока:</p>
            <p className="font-bold">{bidder?.token} {bidder ? pname(bidder) : ''}</p>
            <p className="text-xs text-muted-foreground">
              💰 {((bidder?.money ?? 0) / 1_000).toFixed(0)}K₽
            </p>
          </div>

          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={`Мин. ${minBid.toLocaleString('ru-RU')}`}
              value={bidAmount}
              onChange={e => setBidAmount(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => {
                const amt = parseInt(bidAmount, 10);
                if (amt > 0) {
                  placeBid(amt);
                  setBidAmount('');
                }
              }}
              disabled={!bidAmount || parseInt(bidAmount, 10) <= auctionState.currentBid}
              className="bg-gradient-gold hover:opacity-90 font-bold"
            >
              {t('game.bid')}
            </Button>
          </div>

          <Button
            onClick={() => { passBid(); setBidAmount(''); }}
            variant="outline"
            className="w-full border-2 hover:border-russia-red hover:bg-russia-red/10"
          >
            ❌ Пас
          </Button>
        </div>
      </Card>
    );
  }

  // ---- NORMAL LANDED / ROLLING ----
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
              <p className="font-bold text-lg">{pname(currentPlayer)}</p>
              <p className="text-sm text-russia-gold font-bold">
                💰 {(currentPlayer.money / 1_000).toFixed(0)}K₽
              </p>
            </div>
          </div>
        </div>

        {phase === 'landed' && currentCell.price && (
          <Card className="p-4 bg-gradient-to-br from-muted/80 to-muted/50 border-2 border-russia-gold/30 shadow-sm">
            <h4 className="font-bold mb-3 text-base flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full inline-block border border-black/20"
                style={{ backgroundColor: currentCell.color || '#888' }}
              />
              {t(`cells.${currentCell.nameKey}`)}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-card/50 rounded">
                <span>💰 Цена:</span>
                <span className="font-bold text-russia-gold">{(currentCell.price / 1_000).toFixed(0)}K₽</span>
              </div>
              {currentCell.rent && (
                <div className="flex justify-between p-2 bg-card/50 rounded">
                  <span>🏠 Аренда:</span>
                  <span className="font-bold">{(currentCell.rent[0] / 1_000).toFixed(0)}K₽</span>
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
              💎 {t('game.buy')} ({(currentCell.price! / 1_000).toFixed(0)}K₽)
            </Button>
          )}

          {canPass && (
            <Button
              onClick={passProperty}
              variant="outline"
              className="w-full h-12 border-2 hover:border-russia-red hover:bg-russia-red/10"
            >
              ❌ {t('game.pass')} → Аукцион
            </Button>
          )}

          {phase === 'landed' && !currentCell.price && (
            <Button
              onClick={endTurn}
              className="w-full h-14 text-lg font-bold bg-gradient-russian hover:opacity-90 shadow-strong transition-all hover:scale-105"
              size="lg"
            >
              ➡️ {t('game.endTurn')}
            </Button>
          )}

          {phase === 'landed' && currentCell.price && players.some(p => p.properties.includes(currentCell.id) && p.id !== currentPlayer.id) && (
            <Button
              onClick={endTurn}
              className="w-full h-12 bg-gradient-russian hover:opacity-90 font-bold"
            >
              ➡️ {t('game.endTurn')}
            </Button>
          )}
        </div>

        {phase === 'rolling' && (
          <div className="grid grid-cols-2 gap-2">
            {players.filter((_, i) => i !== cpIdx && !_.bankrupt).length > 0 && (
              <Button
                onClick={() => setTradeOpen(true)}
                variant="outline"
                className="h-9 border-russia-blue/40 text-russia-blue hover:bg-russia-blue/10 text-xs font-semibold"
              >
                🤝 Сделка
              </Button>
            )}
            <Button
              onClick={() => setContractsOpen(true)}
              variant="outline"
              className="h-9 border-russia-gold/40 text-russia-gold hover:bg-russia-gold/10 text-xs font-semibold"
            >
              📜 Контракты
            </Button>
          </div>
        )}

        {/* Abandon game */}
        {phase === 'rolling' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full h-8 text-xs text-muted-foreground hover:text-russia-red hover:bg-russia-red/10"
              >
                🚪 Завершить игру
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Завершить текущую игру?</AlertDialogTitle>
                <AlertDialogDescription>
                  Игра будет прекращена и сохранение удалено. Это действие нельзя отменить.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={resetGame}
                  className="bg-russia-red hover:bg-russia-red/80"
                >
                  Завершить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        <div className="text-xs text-center text-muted-foreground pt-2 border-t border-border/50 space-y-1">
          <div>⚙️ Фаза: <span className="font-semibold">{phase}</span></div>
          <div>🔄 Раунд: <span className="font-semibold">{gameState.round}</span></div>
        </div>
      </div>
      <TradingModal open={tradeOpen} onClose={() => setTradeOpen(false)} />
      <ContractsModal open={contractsOpen} onClose={() => setContractsOpen(false)} />
    </Card>
  );
};
