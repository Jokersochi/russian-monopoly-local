import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState, Player, Cell, GamePhase } from '@/types/game';
import { BOARD_CELLS, PLAYER_TOKENS } from '@/data/board';
import { useToast } from '@/hooks/use-toast';

interface GameContextType {
  gameState: GameState | null;
  initGame: (playerCount: number) => void;
  rollDice: () => void;
  buyProperty: () => void;
  passProperty: () => void;
  endTurn: () => void;
  cells: Cell[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

const STARTING_MONEY = 15000000;
const START_BONUS = 2000000;

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { toast } = useToast();

  const initGame = useCallback((playerCount: number) => {
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      nameKey: `player${i + 1}`,
      token: PLAYER_TOKENS[i].icon,
      money: STARTING_MONEY,
      position: 0,
      properties: [],
      getOutOfJailCards: 0,
      inJail: false,
      jailTurns: 0,
      hasResidence: false,
      contracts: [],
      bankrupt: false,
    }));

    setGameState({
      players,
      currentPlayer: 0,
      dice: [1, 1],
      phase: 'rolling',
      lastRoll: null,
      doubleCount: 0,
      gameLog: [],
      round: 1,
      maxRounds: 50,
    });

    toast({
      title: "Игра началась!",
      description: `${playerCount} игроков. Удачи!`,
    });
  }, [toast]);

  const rollDice = useCallback(() => {
    if (!gameState || gameState.phase !== 'rolling') return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;
    const isDouble = dice1 === dice2;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    const newPosition = (currentPlayer.position + sum) % 40;
    const passedStart = newPosition < currentPlayer.position;

    const updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === gameState.currentPlayer) {
        return {
          ...p,
          position: newPosition,
          money: passedStart ? p.money + START_BONUS : p.money,
        };
      }
      return p;
    });

    setGameState({
      ...gameState,
      dice: [dice1, dice2],
      lastRoll: [dice1, dice2],
      players: updatedPlayers,
      phase: 'landed',
      doubleCount: isDouble ? gameState.doubleCount + 1 : 0,
    });

    toast({
      title: `Выброшено: ${dice1} + ${dice2} = ${sum}`,
      description: isDouble ? "Дубль!" : undefined,
    });
  }, [gameState, toast]);

  const buyProperty = useCallback(() => {
    if (!gameState || gameState.phase !== 'landed') return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    const cell = BOARD_CELLS[currentPlayer.position];

    if (!cell.price || cell.type === 'start' || cell.type === 'jail') return;

    if (currentPlayer.money >= cell.price) {
      const updatedPlayers = gameState.players.map((p, idx) => {
        if (idx === gameState.currentPlayer) {
          return {
            ...p,
            money: p.money - cell.price!,
            properties: [...p.properties, cell.id],
          };
        }
        return p;
      });

      setGameState({
        ...gameState,
        players: updatedPlayers,
        phase: 'rolling',
        currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length,
      });

      toast({
        title: "Куплено!",
        description: `Вы купили ${cell.nameKey} за ${cell.price}₽`,
      });
    } else {
      toast({
        title: "Недостаточно денег",
        variant: "destructive",
      });
    }
  }, [gameState, toast]);

  const passProperty = useCallback(() => {
    if (!gameState || gameState.phase !== 'landed') return;

    setGameState({
      ...gameState,
      phase: 'rolling',
      currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length,
    });

    toast({
      title: "Пропуск",
      description: "Вы пропустили покупку",
    });
  }, [gameState, toast]);

  const endTurn = useCallback(() => {
    if (!gameState) return;

    const nextPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    const newRound = nextPlayer === 0 ? gameState.round + 1 : gameState.round;

    setGameState({
      ...gameState,
      currentPlayer: nextPlayer,
      phase: 'rolling',
      round: newRound,
    });
  }, [gameState]);

  useEffect(() => {
    const saved = localStorage.getItem('russianMonopolyState');
    if (saved) {
      try {
        setGameState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved game', e);
      }
    }
  }, []);

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('russianMonopolyState', JSON.stringify(gameState));
    }
  }, [gameState]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        initGame,
        rollDice,
        buyProperty,
        passProperty,
        endTurn,
        cells: BOARD_CELLS,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
