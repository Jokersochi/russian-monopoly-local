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
  resetGame: () => void;
  cells: Cell[];
}

interface AdvanceResult {
  players: Player[];
  log: LogEntry[];
  nextCurrentPlayer: number;
  nextRound: number;
  nextPhase: GamePhase;
}

const computeNetWorth = (player: Player, cells: Cell[]): number => {
  if (player.bankrupt) return -Infinity;
  const propertyValue = player.properties.reduce(
    (sum, cellId) => sum + (cells[cellId]?.price ?? 0),
    0
  );
  return player.money + propertyValue;
};

const findNextActivePlayer = (players: Player[], fromIdx: number): number => {
  const n = players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (fromIdx + i) % n;
    if (!players[idx].bankrupt) return idx;
  }
  return fromIdx;
};

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

  // Apply post-debit bankruptcy + advance turn to next non-bankrupt player.
  // Returns updated players, log, the new currentPlayer/round/phase.
  const advanceAfterDebit = useCallback(
    (
      players: Player[],
      log: LogEntry[],
      currentIdx: number,
      currentRound: number,
      maxRounds: number
    ): AdvanceResult => {
      // Bankruptcy: any player with money < 0 becomes bankrupt; properties revert
      // to the bank (kept simple — Monopoly's "creditor inherits" is future work).
      const nextPlayers = players.map((p) => {
        if (p.bankrupt || p.money >= 0) return p;
        return { ...p, bankrupt: true, properties: [], money: 0 };
      });
      let nextLog = log;
      players.forEach((p, i) => {
        if (!p.bankrupt && nextPlayers[i].bankrupt) {
          nextLog = [
            ...nextLog,
            makeLog('log.playerBankrupt', 'error', {
              player: t(`players.${p.nameKey}`),
            }),
          ];
        }
      });

      // Game-over checks (in priority order):
      const survivors = nextPlayers.filter((p) => !p.bankrupt);
      if (survivors.length <= 1) {
        const winnerIdx = survivors.length === 1
          ? nextPlayers.indexOf(survivors[0])
          : currentIdx;
        if (survivors.length === 1) {
          nextLog = [
            ...nextLog,
            makeLog('log.gameWon', 'success', {
              player: t(`players.${survivors[0].nameKey}`),
              money: computeNetWorth(survivors[0], BOARD_CELLS),
            }),
          ];
        }
        return {
          players: nextPlayers,
          log: nextLog,
          nextCurrentPlayer: winnerIdx,
          nextRound: currentRound,
          nextPhase: 'game-over',
        };
      }

      // Advance to next active player; round increments on wrap to player 0
      const nextCurrentPlayer = findNextActivePlayer(nextPlayers, currentIdx);
      const wrapped = nextCurrentPlayer <= currentIdx;
      const nextRound = wrapped ? currentRound + 1 : currentRound;

      if (nextRound > maxRounds) {
        // Round limit reached — winner is highest net worth among survivors
        const ranked = nextPlayers
          .map((p, idx) => ({ idx, nw: computeNetWorth(p, BOARD_CELLS) }))
          .sort((a, b) => b.nw - a.nw);
        const winner = nextPlayers[ranked[0].idx];
        nextLog = [
          ...nextLog,
          makeLog('log.gameWon', 'success', {
            player: t(`players.${winner.nameKey}`),
            money: ranked[0].nw,
          }),
        ];
        return {
          players: nextPlayers,
          log: nextLog,
          nextCurrentPlayer: ranked[0].idx,
          nextRound,
          nextPhase: 'game-over',
        };
      }

      return {
        players: nextPlayers,
        log: nextLog,
        nextCurrentPlayer,
        nextRound,
        nextPhase: 'rolling',
      };
    },
    [makeLog, t]
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
    let nextRound = gameState.round;
    let logAfterRent = newLog;
    let playersAfterRent = updatedPlayers;
    let rentTriggered = false;

    if (ownerIdx >= 0 && landedCell.rent && landedCell.rent[0] > 0) {
      const rentAmount = landedCell.rent[0];
      const owner = gameState.players[ownerIdx];
      const ownerName = t(`players.${owner.nameKey}`);

      playersAfterRent = updatedPlayers.map((p, idx) => {
        if (idx === gameState.currentPlayer) return { ...p, money: p.money - rentAmount };
        if (idx === ownerIdx) return { ...p, money: p.money + rentAmount };
        return p;
      });

      logAfterRent = [
        ...newLog,
        makeLog('log.playerPaidRent', 'warning', {
          player: playerName,
          amount: rentAmount,
          owner: ownerName,
        }),
      ];

      toast({
        title: t('game.payRent'),
        description: `${playerName} → ${rentAmount.toLocaleString()}₽ → ${ownerName}`,
      });

      rentTriggered = true;
    }

    if (rentTriggered) {
      const result = advanceAfterDebit(
        playersAfterRent,
        logAfterRent,
        gameState.currentPlayer,
        gameState.round,
        gameState.maxRounds
      );
      playersAfterRent = result.players;
      logAfterRent = result.log;
      nextPhase = result.nextPhase;
      nextCurrentPlayer = result.nextCurrentPlayer;
      nextRound = result.nextRound;
    }

    setGameState({
      ...gameState,
      dice: [dice1, dice2],
      lastRoll: [dice1, dice2],
      players: playersAfterRent,
      gameLog: logAfterRent,
      phase: nextPhase,
      currentPlayer: nextCurrentPlayer,
      round: nextRound,
      doubleCount: isDouble ? gameState.doubleCount + 1 : 0,
    });

    toast({
      title: `Выброшено: ${dice1} + ${dice2} = ${sum}`,
      description: isDouble ? "Дубль!" : undefined,
    });
  }, [gameState, toast, t, makeLog, advanceAfterDebit]);

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

      const logAfterBuy: LogEntry[] = [
        ...gameState.gameLog,
        makeLog('log.playerBought', 'success', {
          player: playerName,
          property: propertyName,
          price: cell.price,
        }),
      ];

      const result = advanceAfterDebit(
        updatedPlayers,
        logAfterBuy,
        gameState.currentPlayer,
        gameState.round,
        gameState.maxRounds
      );

      setGameState({
        ...gameState,
        players: result.players,
        gameLog: result.log,
        phase: result.nextPhase,
        currentPlayer: result.nextCurrentPlayer,
        round: result.nextRound,
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
  }, [gameState, toast, t, makeLog, advanceAfterDebit]);

  const passProperty = useCallback(() => {
    if (!gameState || gameState.phase !== 'landed') return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    const cell = BOARD_CELLS[currentPlayer.position];
    const playerName = t(`players.${currentPlayer.nameKey}`);
    const propertyName = cell.nameKey ? t(`cells.${cell.nameKey}`) : '';

    const logAfterPass: LogEntry[] = [
      ...gameState.gameLog,
      makeLog('log.playerPassed', 'info', {
        player: playerName,
        property: propertyName,
      }),
    ];

    const result = advanceAfterDebit(
      gameState.players,
      logAfterPass,
      gameState.currentPlayer,
      gameState.round,
      gameState.maxRounds
    );

    setGameState({
      ...gameState,
      players: result.players,
      gameLog: result.log,
      phase: result.nextPhase,
      currentPlayer: result.nextCurrentPlayer,
      round: result.nextRound,
    });

    toast({
      title: "Пропуск",
      description: "Вы пропустили покупку",
    });
  }, [gameState, toast, t, makeLog, advanceAfterDebit]);

  const endTurn = useCallback(() => {
    if (!gameState) return;

    const result = advanceAfterDebit(
      gameState.players,
      gameState.gameLog,
      gameState.currentPlayer,
      gameState.round,
      gameState.maxRounds
    );

    setGameState({
      ...gameState,
      players: result.players,
      gameLog: result.log,
      phase: result.nextPhase,
      currentPlayer: result.nextCurrentPlayer,
      round: result.nextRound,
    });
  }, [gameState, advanceAfterDebit]);

  const resetGame = useCallback(() => {
    localStorage.removeItem('russianMonopolyState');
    setGameState(null);
  }, []);

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
        resetGame,
        cells: BOARD_CELLS,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
