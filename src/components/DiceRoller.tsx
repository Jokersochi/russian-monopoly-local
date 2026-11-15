import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Dices, Sparkles } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { useLocale } from '@/contexts/LocaleContext';

const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function DiceFace({
  value,
  rolling,
  delay,
}: {
  value: number;
  rolling: boolean;
  delay: number;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="w-[78px] h-[78px] sm:w-[88px] sm:h-[88px] rounded-[21px] border border-[#f8d6a0]/70 bg-gradient-to-br from-[#fffae9] via-[#e5d2aa] to-[#b89963] shadow-[inset_0_2px_5px_rgba(255,255,255,0.8),0_10px_22px_rgba(0,0,0,0.45)] p-[17px] sm:p-[19px]"
      animate={rolling && !reducedMotion
        ? { rotate: [0, -35, 190, 330, 360], y: [0, -17, -4, -11, 0], scale: [1, 1.1, 0.94, 1.07, 1] }
        : { rotate: 0, y: 0, scale: 1 }}
      transition={{ duration: rolling ? 0.68 : 0.2, delay, ease: 'easeOut' }}
      aria-label={'Кубик: ' + value}
    >
      <div className="grid grid-cols-3 grid-rows-3 w-full h-full gap-1">
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className={PIPS[value]?.includes(index)
              ? 'rounded-full bg-[#3d2b1d] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.3)]'
              : 'rounded-full bg-transparent'}
          />
        ))}
      </div>
    </motion.div>
  );
}

export const DiceRoller = () => {
  const { gameState, rollDice } = useGame();
  const { t } = useLocale();
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (!rolling) return;
    const timer = window.setTimeout(() => setRolling(false), 850);
    return () => window.clearTimeout(timer);
  }, [rolling]);

  if (!gameState) return null;

  const canRoll = gameState.phase === 'rolling' || gameState.phase === 'jail';
  const values = gameState.lastRoll ?? [1, 1];
  const sum = values[0] + values[1];
  const doubles = Boolean(gameState.lastRoll && values[0] === values[1]);

  const handleRoll = () => {
    if (!canRoll || rolling) return;
    setRolling(true);
    rollDice();
  };

  return (
    <section className="rounded-[24px] border border-[#d4ab68]/30 bg-gradient-to-b from-[#1c2730] to-[#0e161d] shadow-[0_14px_45px_rgba(0,0,0,0.36)] overflow-hidden">
      <div className="px-5 pt-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-[#b6a386]">Кубики · ваш ход</p>
          <h3 className="font-black text-xl text-[#efd8b0] flex items-center gap-2 mt-1">
            <Dices size={21} className="text-[#d6a85e]" /> {t('game.rollDice')}
          </h3>
        </div>
        <Sparkles className="text-[#d6a85e]/50" size={24} />
      </div>
      <div className="flex items-center justify-center gap-5 py-5">
        <DiceFace value={values[0]} rolling={rolling} delay={0} />
        <DiceFace value={values[1]} rolling={rolling} delay={0.07} />
      </div>
      <div className="mx-4 px-4 py-3 border border-[#bb995f]/20 bg-[#0a1119]/70 rounded-xl flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-[#a99b83]">Результат</span>
        <div className="flex items-center gap-3">
          {doubles && <span className="text-xs font-bold text-[#f1bf63]">Дубль!</span>}
          <span className="text-3xl font-black text-[#f7d494] tabular-nums">
            {gameState.lastRoll ? sum : '—'}
          </span>
        </div>
      </div>
      <motion.button
        type="button"
        onClick={handleRoll}
        disabled={!canRoll || rolling}
        whileHover={canRoll && !rolling ? { scale: 1.02 } : undefined}
        whileTap={canRoll && !rolling ? { scale: 0.97 } : undefined}
        className="m-4 w-[calc(100%-2rem)] h-14 rounded-xl bg-gradient-to-r from-[#e4b862] via-[#f7d18b] to-[#bd8844] text-[#271b11] font-black text-base tracking-wide shadow-[0_8px_25px_rgba(220,153,52,0.18)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-[filter,opacity]"
      >
        {rolling ? 'Бросаем…' : 'БРОСИТЬ КУБИКИ'}
      </motion.button>
    </section>
  );
};
