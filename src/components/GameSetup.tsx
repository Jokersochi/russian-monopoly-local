import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/LocaleContext';
import { useGame } from '@/contexts/GameContext';
import { cn } from '@/lib/utils';

export const GameSetup = () => {
  const [playerCount, setPlayerCount] = useState(4);
  const { t, locale, setLocale } = useLocale();
  const { initGame } = useGame();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-board opacity-20"></div>
      <Card className="w-full max-w-md shadow-strong backdrop-blur-sm bg-card/95 border-2 border-russia-gold/20 relative z-10">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-5xl font-bold bg-gradient-russian bg-clip-text text-transparent drop-shadow-lg">
            {t('game.title')}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {locale === 'ru' ? 'Настольная экономическая игра' : 'Board Economic Game'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-blue" aria-hidden="true">👥</span>
              {t('game.playerCount')}
            </label>
            <div className="grid grid-cols-5 gap-2" role="group" aria-label={t('game.playerCount')}>
              {[2, 3, 4, 5, 6].map((count) => (
                <Button
                  key={count}
                  variant={playerCount === count ? 'default' : 'outline'}
                  onClick={() => setPlayerCount(count)}
                  aria-label={`${count} ${t('game.players').toLowerCase()}`}
                  aria-pressed={playerCount === count}
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

          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-russia-gold" aria-hidden="true">🌍</span>
              {t('game.language')}
            </label>
            <div className="grid grid-cols-4 gap-2" role="group" aria-label={t('game.language')}>
              {[
                { code: 'ru', flag: '🇷🇺', name: 'Русский' },
                { code: 'en', flag: '🇬🇧', name: 'English' },
                { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
                { code: 'es', flag: '🇪🇸', name: 'Español' }
              ].map(({ code, flag, name }) => (
                <Button
                  key={code}
                  variant={locale === code ? 'secondary' : 'outline'}
                  onClick={() => setLocale(code as any)}
                  aria-label={name}
                  aria-pressed={locale === code}
                  title={name}
                  className={cn(
                    "transition-all h-12 text-lg",
                    locale === code && "bg-russia-blue text-white shadow-strong scale-110"
                  )}
                >
                  {flag}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => initGame(playerCount)}
            className="w-full bg-gradient-russian hover:opacity-90 text-lg py-7 shadow-strong transition-all hover:scale-105 font-bold"
            size="lg"
          >
            <span aria-hidden="true">✨</span> {t('game.start')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
