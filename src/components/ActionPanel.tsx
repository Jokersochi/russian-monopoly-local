import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';

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
    cells,
  } = useGame();
  const { t } = useLocale();
  const [bidAmount, setBidAmount] = useState('');

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
    const winner = players.length === 1 ? players[0] : [...players].sort((a, b) => b.money - a.money)[0];
    return (
      <Card className="shadow-board backdrop-blur-sm bg-card/95 border-2 border-russia-gold/40">
        <div className="p-6 text-center space-y-4">
          <div className="text-5xl">🏆</div>
          <h3 className="text-2xl font-bold text-russia-gold">{t('game.gameOver')}</h3>
          {winner && (
            <div className="p-4 bg-gradient-gold/20 rounded-lg border border-russia-gold/30">
              <p className="text-lg font-bold">{t('game.winner')}: {t(`players.${winner.nameKey}`)}</p>
              <p className="text-russia-gold text-xl font-bold mt-1">
                💰 {(winner.money / 1_000_000).toFixed(2)}M₽
              </p>
            </div>
          )}
          <div className="space-y-2 text-sm">
            {[...players].sort((a, b) => b.money - a.money).map((p, i) => (
              <div key={p.id} className="flex justify-between items-center p-2 bg-card/50 rounded">
                <span>{i + 1}. {p.token} {t(`players.${p.nameKey}`)}</span>
                <span className="font-bold text-russia-gold">{(p.money / 1_000).toFixed(0)}K₽</span>
              </div>
            ))}
          </div>
          <Button
            onClick={() => initGame(players.length)}
            className="w-full h-12 bg-gradient-russian hover:opacity-90 font-bold"
          >
            🔄 {t('game.newGame')}
          </Button>
        </div>
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
              {currentPlayer.token} {t(`players.${currentPlayer.nameKey}`)}
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
    const diceSum = dice[0] + dice[1];
    const rent = owner
      ? (() => {
          if (!currentCell.rent) return 0;
          if (currentCell.type === 'transport') {
            const count = owner.properties.filter(pid => cells[pid]?.type === 'transport').length;
            return [250_000, 500_000, 1_000_000, 2_000_000][Math.min(count - 1, 3)];
          }
          if (currentCell.type === 'utility') {
            const count = owner.properties.filter(pid => cells[pid]?.type === 'utility').length;
            return count >= 2 ? diceSum * 100_000 : diceSum * 40_000;
          }
          const same = cells.filter(c => c.color && c.color === currentCell.color);
          const monopoly = same.length > 0 && same.every(c => owner.properties.includes(c.id));
          return monopoly ? currentCell.rent[0] * 2 : currentCell.rent[0];
        })()
      : 0;

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
              <span className="font-bold">{owner ? `${owner.token} ${t(`players.${owner.nameKey}`)}` : '—'}</span>
            </div>
            <div className="flex justify-between text-base">
              <span>💰 Аренда:</span>
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
                <span className="font-bold">{players[auctionState.highBidder]?.token} {t(`players.${players[auctionState.highBidder]?.nameKey}`)}</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-card/50 rounded-lg border border-russia-gold/20">
            <p className="text-xs text-muted-foreground mb-1">Ход игрока:</p>
            <p className="font-bold">{bidder?.token} {t(`players.${bidder?.nameKey}`)}</p>
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
              <p className="font-bold text-lg">{t(`players.${currentPlayer.nameKey}`)}</p>
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

        <div className="text-xs text-center text-muted-foreground pt-3 border-t border-border/50 space-y-1">
          <div>⚙️ Фаза: <span className="font-semibold">{phase}</span></div>
          <div>🔄 Раунд: <span className="font-semibold">{gameState.round}</span></div>
        </div>
      </div>
    </Card>
  );
};
