import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useLocale } from '@/contexts/LocaleContext';
import { useGame } from '@/contexts/GameContext';
import { getSlotInfo, SaveSlotInfo } from '@/contexts/GameContext';
import { cn } from '@/lib/utils';

const ROUNDS_OPTIONS = [20, 30, 50, 75, 100];
const MONEY_OPTIONS = [
  { label: '5M', value: 5_000_000 },
  { label: '10M', value: 10_000_000 },
  { label: '15M', value: 15_000_000 },
  { label: '20M', value: 20_000_000 },
  { label: '30M', value: 30_000_000 },
];
const SAVE_SLOTS = [1, 2, 3];

export const GameSetup = () => {
  const [selectedSlot, setSelectedSlot] = useState<number>(1);
  const [slotInfos, setSlotInfos] = useState<Record<number, SaveSlotInfo | null>>({});
  const [playerCount, setPlayerCount] = useState(4);
  const [playerNames, setPlayerNames] = useState<string[]>(Array(6).fill(''));
  const [maxRounds, setMaxRounds] = useState(50);
  const [startingMoney, setStartingMoney] = useState(15_000_000);
  const { t, locale, setLocale } = useLocale();
  const { initGame, loadSlot, activeSlot } = useGame();

  useEffect(() => {
    const infos: Record<number, SaveSlotInfo | null> = {};
    SAVE_SLOTS.forEach(s => { infos[s] = getSlotInfo(s); });
    setSlotInfos(infos);
    // Pre-select the last active slot
    setSelectedSlot(activeSlot);
  }, [activeSlot]);

  const handleStart = () => {
    const names = playerNames.slice(0, playerCount).map((n) => n.trim() || '');
    initGame(playerCount, {
      playerNames: names.some(n => n) ? names : undefined,
      maxRounds,
      startingMoney,
    }, selectedSlot);
  };

  const handleContinue = (slot: number) => {
    loadSlot(slot);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-board opacity-20"></div>
      <Card className="w-full max-w-lg shadow-strong backdrop-blur-sm bg-card/95 border-2 border-russia-gold/20 relative z-10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-5xl font-bold bg-gradient-russian bg-clip-text text-transparent drop-shadow-lg">
            {t('game.title')}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {locale === 'ru' ? 'Настольная экономическая игра' : 'Board Economic Game'}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* Save slots */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-gold">💾</span>
              Слот сохранения
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAVE_SLOTS.map(slot => {
                const info = slotInfos[slot];
                const isSelected = selectedSlot === slot;
                return (
                  <div key={slot} className="space-y-1">
                    <button
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'w-full rounded-lg border-2 p-2.5 text-left transition-all text-xs',
                        isSelected
                          ? 'border-russia-gold bg-russia-gold/10 shadow-strong'
                          : 'border-border/40 hover:border-russia-gold/50 bg-card/50 hover:bg-card/80'
                      )}
                    >
                      <div className="font-bold text-sm mb-1">Слот {slot}</div>
                      {info ? (
                        <>
                          <div className="text-muted-foreground truncate">
                            {info.playerNames.slice(0, 3).join(', ')}
                            {info.playerNames.length > 3 && '…'}
                          </div>
                          <div className="text-russia-gold">
                            Раунд {info.round}/{info.maxRounds}
                          </div>
                        </>
                      ) : (
                        <div className="text-muted-foreground/60">Пусто</div>
                      )}
                    </button>
                    {info && (
                      <Button
                        size="sm"
                        onClick={() => handleContinue(slot)}
                        className="w-full h-7 text-xs bg-gradient-gold hover:opacity-90 font-bold"
                      >
                        ▶ Продолжить
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Player count */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-blue">👥</span>
              {t('game.playerCount')}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((count) => (
                <Button
                  key={count}
                  variant={playerCount === count ? 'default' : 'outline'}
                  onClick={() => setPlayerCount(count)}
                  className={cn(
                    "transition-all h-12 text-lg font-bold",
                    playerCount === count && "bg-gradient-russian shadow-strong scale-110"
                  )}
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {/* Player names */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-gold">✏️</span>
              {t('game.playerNames')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: playerCount }).map((_, i) => (
                <Input
                  key={i}
                  placeholder={t(`players.player${i + 1}`)}
                  value={playerNames[i]}
                  onChange={(e) => {
                    const next = [...playerNames];
                    next[i] = e.target.value;
                    setPlayerNames(next);
                  }}
                  maxLength={20}
                  className="h-9 text-sm bg-background/60"
                />
              ))}
            </div>
          </div>

          {/* Max rounds */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-blue">🔄</span>
              {t('game.maxRounds')}: <strong className="text-russia-gold">{maxRounds}</strong>
            </label>
            <div className="flex gap-2 flex-wrap">
              {ROUNDS_OPTIONS.map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={maxRounds === r ? 'default' : 'outline'}
                  onClick={() => setMaxRounds(r)}
                  className={cn(
                    "transition-all font-bold",
                    maxRounds === r && "bg-russia-blue text-white shadow-strong"
                  )}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>

          {/* Starting money */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-gold">💰</span>
              {t('game.startMoney')}: <strong className="text-russia-gold">{(startingMoney / 1_000_000).toFixed(0)}M₽</strong>
            </label>
            <div className="flex gap-2 flex-wrap">
              {MONEY_OPTIONS.map(({ label, value }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={startingMoney === value ? 'default' : 'outline'}
                  onClick={() => setStartingMoney(value)}
                  className={cn(
                    "transition-all font-bold",
                    startingMoney === value && "bg-russia-gold text-black shadow-strong"
                  )}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-gold">🌍</span>
              {t('game.language')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {([
                { code: 'ru', flag: '🇷🇺', name: 'Русский' },
                { code: 'en', flag: '🇬🇧', name: 'English' },
                { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
                { code: 'es', flag: '🇪🇸', name: 'Español' }
              ] as const).map(({ code, flag, name }) => (
                <Tooltip key={code}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={locale === code ? 'secondary' : 'outline'}
                      onClick={() => setLocale(code as "ru" | "en" | "de" | "es")}
                      aria-label={name}
                      aria-pressed={locale === code}
                      className={cn(
                        "transition-all h-12 text-lg",
                        locale === code && "bg-russia-blue text-white shadow-strong scale-110"
                      )}
                    >
                      <span aria-hidden="true">{flag}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          <Button
            onClick={handleStart}
            className="w-full bg-gradient-russian hover:opacity-90 text-lg py-7 shadow-strong transition-all hover:scale-105 font-bold"
            size="lg"
          >
            ✨ {t('game.start')} (слот {selectedSlot})
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
