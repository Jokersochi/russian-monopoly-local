import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocale } from '@/contexts/LocaleContext';
import { useGame } from '@/contexts/GameContext';

export const GameSetup = () => {
  const [playerCount, setPlayerCount] = useState(4);
  const { t, locale, setLocale } = useLocale();
  const { initGame } = useGame();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-board">
      <Card className="w-full max-w-md shadow-strong">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-russian bg-clip-text text-transparent">
            {t('game.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('game.playerCount')}</label>
            <div className="grid grid-cols-5 gap-2">
              {[2, 3, 4, 5, 6].map((count) => (
                <Button
                  key={count}
                  variant={playerCount === count ? 'default' : 'outline'}
                  onClick={() => setPlayerCount(count)}
                  className="transition-all"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">{t('game.language')}</label>
            <div className="grid grid-cols-4 gap-2">
              {['ru', 'en', 'de', 'es'].map((lang) => (
                <Button
                  key={lang}
                  variant={locale === lang ? 'secondary' : 'outline'}
                  onClick={() => setLocale(lang as any)}
                  className="transition-all"
                >
                  {lang.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => initGame(playerCount)}
            className="w-full bg-gradient-russian hover:opacity-90 text-lg py-6"
            size="lg"
          >
            {t('game.start')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
