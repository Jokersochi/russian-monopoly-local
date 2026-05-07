import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';
import { CONTRACTS } from '@/data/board';

interface ContractsModalProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  tourism: '🌍',
  transport: '🚂',
  industry: '🏭',
  culture: '🎭',
  education: '🎓',
  nature: '🌲',
};

export const ContractsModal = ({ open, onClose }: ContractsModalProps) => {
  const { gameState, buyContract } = useGame();
  const { t } = useLocale();

  if (!gameState) return null;

  const { players, currentPlayer: cpIdx, phase } = gameState;
  const currentPlayer = players[cpIdx];
  const canBuy = phase === 'rolling';

  const getContractOwner = (contractId: string) =>
    players.find(p => p.contracts.includes(contractId));

  const pname = (p: typeof players[0]) => p.displayName || t(`players.${p.nameKey}`);

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-sm bg-card/98 border-2 border-russia-gold/30 shadow-board">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📜 Контракты
          </DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          Контракт добавляет фиксированный бонус к каждой полученной аренде в категории
        </p>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {CONTRACTS.map(contract => {
            const owner = getContractOwner(contract.id);
            const isOwned = !!owner;
            const isOwnedByMe = owner?.id === currentPlayer.id;
            const canAfford = currentPlayer.money >= contract.price;
            const icon = CATEGORY_ICONS[contract.category] ?? '📄';

            return (
              <div
                key={contract.id}
                className={`p-3 rounded-lg border text-sm space-y-2 ${
                  isOwnedByMe
                    ? 'bg-russia-gold/10 border-russia-gold/40'
                    : isOwned
                    ? 'bg-muted/30 border-border/30 opacity-70'
                    : 'bg-card/60 border-border/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    {icon} {t(`contracts.${contract.nameKey}`)}
                  </span>
                  {isOwned ? (
                    <Badge variant={isOwnedByMe ? 'default' : 'secondary'} className="text-xs">
                      {isOwnedByMe ? 'Мой' : `${owner.token} ${pname(owner)}`}
                    </Badge>
                  ) : (
                    <span className="text-russia-gold font-bold text-xs">
                      {(contract.price / 1_000).toFixed(0)}K₽
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {t(`contracts.${contract.nameKey}_desc`)}
                </p>

                {!isOwned && canBuy && (
                  <Button
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => { buyContract(contract.id); onClose(); }}
                    className="w-full h-7 text-xs bg-gradient-gold hover:opacity-90 font-bold"
                  >
                    {canAfford
                      ? `📜 Заключить за ${(contract.price / 1_000).toFixed(0)}K₽`
                      : `Нужно ${(contract.price / 1_000).toFixed(0)}K₽`}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
