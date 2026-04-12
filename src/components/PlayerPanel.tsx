import { useGameStore } from '@/store/useGameStore';
import { useLocale } from '@/contexts/LocaleContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export const PlayerPanel = () => {
  const { gameState } = useGameStore();
  const { t } = useLocale();

  if (!gameState) return null;

  return (
    <div className="h-full bg-leather-texture rounded-[40px] shadow-2xl border-[10px] border-leather ring-[1px] ring-white/5 overflow-hidden flex flex-col">
      <div className="p-6 border-b border-white/10 bg-black/20">
        <h3 className="text-2xl font-serif italic text-leather-light tracking-widest uppercase">
          {t('game.players')}
        </h3>
      </div>
      <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-hide">
        {gameState.players.map((player, idx) => {
          const isCurrentPlayer = idx === gameState.currentPlayer;

          return (
            <div
              key={player.id}
              className={cn(
                'p-6 rounded-[20px] transition-all relative overflow-hidden',
                isCurrentPlayer && 'bg-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.1),0_10px_20px_rgba(0,0,0,0.3)] border border-white/20',
                !isCurrentPlayer && 'opacity-60 grayscale-[0.5]',
                player.bankrupt && 'opacity-30'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="text-4xl drop-shadow">{player.token}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={cn(
                      "font-bold truncate text-lg text-white/90 font-serif",
                      isCurrentPlayer && "text-russia-gold"
                    )}>
                      {t(`players.${player.nameKey}`)}
                    </p>
                    {isCurrentPlayer && (
                      <Badge className="bg-gradient-russian text-xs shadow-sm">
                        ⭐ {t('game.yourTurn')}
                      </Badge>
                    )}
                    {player.bankrupt && (
                      <Badge variant="destructive" className="text-xs">
                        💸 {t('game.bankrupt')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-3 mt-1.5 text-sm">
                    <span className="text-russia-gold font-bold text-base">
                      💰 {(player.money / 1000).toFixed(0)}K₽
                    </span>
                    <span className="text-muted-foreground">
                      🏠 {player.properties.length} {t('game.properties')}
                    </span>
                  </div>
                  {player.hasResidence && (
                    <Badge variant="secondary" className="mt-2 text-xs bg-russia-blue/20 border-russia-blue/30">
                      🏰 Резиденция
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
