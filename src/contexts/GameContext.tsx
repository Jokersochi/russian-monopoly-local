import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Player, Cell, GamePhase, LogEntry } from '@/types/game';
import { BOARD_CELLS, PLAYER_TOKENS } from '@/data/board';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/LocaleContext';

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
  const { t } = useLocale();
  const logIdRef = useRef(0);

  const makeLog = useCallback(
    (textKey: string, type: LogEntry['type'], params?: LogEntry['params']): LogEntry => ({
      id: Date.now() * 1000 + (logIdRef.current++ % 1000),
      textKey,
      params,
      type,
      timestamp: Date.now(),
    }),
    []
  );

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
    const playerName = t(`players.${currentPlayer.nameKey}`);
    const newPosition = (currentPlayer.position + sum) % 40;
    const passedStart = newPosition < currentPlayer.position;
    const landedCell = BOARD_CELLS[newPosition];

    const ownerIdx = gameState.players.findIndex(
      (p, idx) =>
        idx !== gameState.currentPlayer &&
        !p.bankrupt &&
        p.properties.includes(landedCell.id)
    );

    let updatedPlayers = gameState.players.map((p, idx) => {
      if (idx === gameState.currentPlayer) {
        return {
          ...p,
          position: newPosition,
          money: passedStart ? p.money + START_BONUS : p.money,
        };
      }
      return p;
    });

    const newLog: LogEntry[] = [
      ...gameState.gameLog,
      makeLog('log.playerRolled', 'info', {
        player: playerName,
        dice: `${dice1}+${dice2}=${sum}`,
      }),
    ];

    if (passedStart) {
      newLog.push(
        makeLog('log.passedStart', 'success', {
          player: playerName,
          amount: START_BONUS,
        })
      );
    }

    let nextPhase: GamePhase = 'landed';
    let nextCurrentPlayer = gameState.currentPlayer;

    if (ownerIdx >= 0 && landedCell.rent && landedCell.rent[0] > 0) {
      const rentAmount = landedCell.rent[0];
      const owner = gameState.players[ownerIdx];
      const ownerName = t(`players.${owner.nameKey}`);

      updatedPlayers = updatedPlayers.map((p, idx) => {
        if (idx === gameState.currentPlayer) return { ...p, money: p.money - rentAmount };
        if (idx === ownerIdx) return { ...p, money: p.money + rentAmount };
        return p;
      });

      newLog.push(
        makeLog('log.playerPaidRent', 'warning', {
          player: playerName,
          amount: rentAmount,
          owner: ownerName,
        })
      );

      toast({
        title: t('game.payRent'),
        description: `${playerName} → ${rentAmount.toLocaleString()}₽ → ${ownerName}`,
      });

      nextPhase = 'rolling';
      nextCurrentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    }

    setGameState({
      ...gameState,
      dice: [dice1, dice2],
      lastRoll: [dice1, dice2],
      players: updatedPlayers,
      gameLog: newLog,
      phase: nextPhase,
      currentPlayer: nextCurrentPlayer,
      doubleCount: isDouble ? gameState.doubleCount + 1 : 0,
    });

    toast({
      title: `Выброшено: ${dice1} + ${dice2} = ${sum}`,
      description: isDouble ? "Дубль!" : undefined,
    });
  }, [gameState, toast, t, makeLog]);

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

      const playerName = t(`players.${currentPlayer.nameKey}`);
      const propertyName = t(`cells.${cell.nameKey}`);

      setGameState({
        ...gameState,
        players: updatedPlayers,
        phase: 'rolling',
        currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length,
        gameLog: [
          ...gameState.gameLog,
          makeLog('log.playerBought', 'success', {
            player: playerName,
            property: propertyName,
            price: cell.price,
          }),
        ],
      });

      toast({
        title: "Куплено!",
        description: `${propertyName} — ${cell.price.toLocaleString()}₽`,
      });
    } else {
      toast({
        title: "Недостаточно денег",
        variant: "destructive",
      });
    }
  }, [gameState, toast, t, makeLog]);

  const passProperty = useCallback(() => {
    if (!gameState || gameState.phase !== 'landed') return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    const cell = BOARD_CELLS[currentPlayer.position];
    const playerName = t(`players.${currentPlayer.nameKey}`);
    const propertyName = cell.nameKey ? t(`cells.${cell.nameKey}`) : '';

    setGameState({
      ...gameState,
      phase: 'rolling',
      currentPlayer: (gameState.currentPlayer + 1) % gameState.players.length,
      gameLog: [
        ...gameState.gameLog,
        makeLog('log.playerPassed', 'info', {
          player: playerName,
          property: propertyName,
        }),
      ],
    });

    toast({
      title: "Пропуск",
      description: "Вы пропустили покупку",
    });
  }, [gameState, toast, t, makeLog]);

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
