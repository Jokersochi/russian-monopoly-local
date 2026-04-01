import { useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';

export const useKeyboardShortcuts = () => {
  const { rollDice, buyProperty, passProperty, endTurn, canRoll, canBuy, canPass, canEndTurn } = useGame();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (key === ' ' && canRoll) { e.preventDefault(); rollDice(); }
      else if (key === 'b' && canBuy) buyProperty();
      else if (key === 'p' && canPass) passProperty();
      else if (key === 'enter' && canEndTurn) endTurn();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rollDice, buyProperty, passProperty, endTurn, canRoll, canBuy, canPass, canEndTurn]);
};
