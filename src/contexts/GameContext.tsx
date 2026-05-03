import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Player, Cell, GamePhase, LogEntry } from '@/types/game';
import { BOARD_CELLS, PLAYER_TOKENS, CHANCE_CARDS, TRIAL_CARDS } from '@/data/board';
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
  payJailFine: () => void;
  buildHouse: (cellId: number) => void;
  cells: Cell[];
}

const MAX_HOUSES = 5;

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
  const houseValue = Object.entries(player.houses ?? {}).reduce(
    (sum, [cellId, count]) => sum + (cells[Number(cellId)]?.houseCost ?? 0) * count,
    0
  );
  return player.money + propertyValue + houseValue;
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
const JAIL_CELL = 10;
const JAIL_FINE = 500000;

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
  const advanceAfterDebit = useCallback(
    (
      players: Player[],
      log: LogEntry[],
      currentIdx: number,
      currentRound: number,
      maxRounds: number
    ): AdvanceResult => {
      const nextPlayers = players.map((p) => {
        if (p.bankrupt || p.money >= 0) return p;
        return { ...p, bankrupt: true, properties: [], houses: {}, money: 0 };
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

      const nextCurrentPlayer = findNextActivePlayer(nextPlayers, currentIdx);
      const wrapped = nextCurrentPlayer <= currentIdx;
      const nextRound = wrapped ? currentRound + 1 : currentRound;

      if (nextRound > maxRounds) {
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
      houses: {},
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

    let workingLog: LogEntry[] = [
      ...gameState.gameLog,
      makeLog('log.playerRolled', 'info', { player: playerName, dice: `${dice1}+${dice2}=${sum}` }),
    ];
    let workingPlayers = gameState.players;

    toast({ title: `Выброшено: ${dice1} + ${dice2} = ${sum}`, description: isDouble ? 'Дубль!' : undefined });

    // ── JAIL ROLL ─────────────────────────────────────────────────────────────
    if (currentPlayer.inJail) {
      if (!isDouble && currentPlayer.jailTurns < 2) {
        // Stay in jail
        workingLog = [...workingLog, makeLog('log.stayedInJail', 'warning', {
          player: playerName, turn: String(currentPlayer.jailTurns + 1),
        })];
        workingPlayers = workingPlayers.map((p, idx) =>
          idx === gameState.currentPlayer ? { ...p, jailTurns: p.jailTurns + 1 } : p
        );
        const result = advanceAfterDebit(workingPlayers, workingLog, gameState.currentPlayer, gameState.round, gameState.maxRounds);
        setGameState({
          ...gameState, dice: [dice1, dice2], lastRoll: [dice1, dice2],
          players: result.players, gameLog: result.log,
          phase: result.nextPhase, currentPlayer: result.nextCurrentPlayer,
          round: result.nextRound, doubleCount: 0,
        });
        return;
      }

      // Exit jail (doubles or forced after 3rd turn)
      if (!isDouble) {
        workingPlayers = workingPlayers.map((p, idx) =>
          idx === gameState.currentPlayer ? { ...p, money: p.money - JAIL_FINE } : p
        );
        workingLog = [...workingLog, makeLog('log.paidJailFine', 'warning', { player: playerName, amount: JAIL_FINE })];
      } else {
        workingLog = [...workingLog, makeLog('log.exitedJailDoubles', 'success', { player: playerName })];
      }
      workingPlayers = workingPlayers.map((p, idx) =>
        idx === gameState.currentPlayer ? { ...p, inJail: false, jailTurns: 0 } : p
      );
    }

    // ── TRIPLE DOUBLES → JAIL ─────────────────────────────────────────────────
    const newDoubleCount = isDouble ? gameState.doubleCount + 1 : 0;
    if (!currentPlayer.inJail && isDouble && newDoubleCount >= 3) {
      workingPlayers = workingPlayers.map((p, idx) =>
        idx === gameState.currentPlayer ? { ...p, position: JAIL_CELL, inJail: true, jailTurns: 0 } : p
      );
      workingLog = [...workingLog, makeLog('log.wentToJailDoubles', 'warning', { player: playerName })];
      const result = advanceAfterDebit(workingPlayers, workingLog, gameState.currentPlayer, gameState.round, gameState.maxRounds);
      setGameState({
        ...gameState, dice: [dice1, dice2], lastRoll: [dice1, dice2],
        players: result.players, gameLog: result.log,
        phase: result.nextPhase, currentPlayer: result.nextCurrentPlayer,
        round: result.nextRound, doubleCount: 0,
      });
      return;
    }

    // ── MOVEMENT ──────────────────────────────────────────────────────────────
    const fromPosition = workingPlayers[gameState.currentPlayer].position;
    const newPosition = (fromPosition + sum) % 40;
    const passedStart = newPosition < fromPosition;
    const landedCell = BOARD_CELLS[newPosition];

    workingPlayers = workingPlayers.map((p, idx) => {
      if (idx !== gameState.currentPlayer) return p;
      return { ...p, position: newPosition, money: passedStart ? p.money + START_BONUS : p.money };
    });

    if (passedStart) {
      workingLog = [...workingLog, makeLog('log.passedStart', 'success', { player: playerName, amount: START_BONUS })];
    }

    // ── GO TO JAIL ────────────────────────────────────────────────────────────
    if (landedCell.type === 'go-to-jail') {
      workingPlayers = workingPlayers.map((p, idx) =>
        idx === gameState.currentPlayer ? { ...p, position: JAIL_CELL, inJail: true, jailTurns: 0 } : p
      );
      workingLog = [...workingLog, makeLog('log.wentToJail', 'warning', { player: playerName })];
      const result = advanceAfterDebit(workingPlayers, workingLog, gameState.currentPlayer, gameState.round, gameState.maxRounds);
      setGameState({
        ...gameState, dice: [dice1, dice2], lastRoll: [dice1, dice2],
        players: result.players, gameLog: result.log,
        phase: result.nextPhase, currentPlayer: result.nextCurrentPlayer,
        round: result.nextRound, doubleCount: 0,
      });
      return;
    }

    // ── TAX ───────────────────────────────────────────────────────────────────
    if (landedCell.type === 'tax' && landedCell.taxAmount) {
      workingPlayers = workingPlayers.map((p, idx) =>
        idx === gameState.currentPlayer ? { ...p, money: p.money - landedCell.taxAmount! } : p
      );
      workingLog = [...workingLog, makeLog('log.paidTax', 'warning', {
        player: playerName, cell: t(`cells.${landedCell.nameKey}`), amount: landedCell.taxAmount,
      })];
      toast({ title: t(`cells.${landedCell.nameKey}`), description: `-${landedCell.taxAmount.toLocaleString()}₽` });
      const result = advanceAfterDebit(workingPlayers, workingLog, gameState.currentPlayer, gameState.round, gameState.maxRounds);
      setGameState({
        ...gameState, dice: [dice1, dice2], lastRoll: [dice1, dice2],
        players: result.players, gameLog: result.log,
        phase: result.nextPhase, currentPlayer: result.nextCurrentPlayer,
        round: result.nextRound, doubleCount: newDoubleCount,
      });
      return;
    }

    // ── CARD DRAW ─────────────────────────────────────────────────────────────
    if (landedCell.type === 'chance' || landedCell.type === 'trial') {
      const deck = landedCell.type === 'chance' ? CHANCE_CARDS : TRIAL_CARDS;
      const card = deck[Math.floor(Math.random() * deck.length)];
      const cardText = t(`cards.${card.textKey}`);

      workingLog = [...workingLog, makeLog('log.drewCard', 'info', { player: playerName, card: cardText })];
      toast({ title: t(`cells.${landedCell.nameKey}`), description: cardText });

      if (card.effect.money !== undefined) {
        workingPlayers = workingPlayers.map((p, idx) =>
          idx === gameState.currentPlayer ? { ...p, money: p.money + card.effect.money! } : p
        );
      }

      if (card.effect.collectFromPlayers !== undefined) {
        const amount = card.effect.collectFromPlayers;
        const activeCount = workingPlayers.filter((p, idx) => idx !== gameState.currentPlayer && !p.bankrupt).length;
        workingPlayers = workingPlayers.map((p, idx) => {
          if (idx === gameState.currentPlayer) return { ...p, money: p.money + activeCount * amount };
          if (!p.bankrupt) return { ...p, money: p.money - amount };
          return p;
        });
      }

      if (card.effect.getOutOfJail) {
        workingPlayers = workingPlayers.map((p, idx) =>
          idx === gameState.currentPlayer ? { ...p, getOutOfJailCards: p.getOutOfJailCards + 1 } : p
        );
      }

      if (card.effect.moveToCell !== undefined) {
        workingPlayers = workingPlayers.map((p, idx) =>
          idx === gameState.currentPlayer ? { ...p, position: card.effect.moveToCell! } : p
        );
      }

      if (card.effect.taxPerProperty !== undefined) {
        const rate = card.effect.taxPerProperty;
        const props = workingPlayers[gameState.currentPlayer].properties;
        let tax: number;
        if (rate > 0) {
          tax = props.length * rate;
        } else {
          const totalValue = props.reduce((sum, cellId) => sum + (BOARD_CELLS[cellId]?.price ?? 0), 0);
          tax = Math.floor(totalValue * Math.abs(rate));
        }
        workingPlayers = workingPlayers.map((p, idx) =>
          idx === gameState.currentPlayer ? { ...p, money: p.money - tax } : p
        );
      }

      const result = advanceAfterDebit(workingPlayers, workingLog, gameState.currentPlayer, gameState.round, gameState.maxRounds);
      setGameState({
        ...gameState, dice: [dice1, dice2], lastRoll: [dice1, dice2],
        players: result.players, gameLog: result.log,
        phase: result.nextPhase, currentPlayer: result.nextCurrentPlayer,
        round: result.nextRound, doubleCount: newDoubleCount,
      });
      return;
    }

    // ── RENT (owned by another player) ────────────────────────────────────────
    const ownerIdx = gameState.players.findIndex(
      (p, idx) =>
        idx !== gameState.currentPlayer &&
        !p.bankrupt &&
        p.properties.includes(landedCell.id)
    );

    if (ownerIdx >= 0 && landedCell.rent && landedCell.rent[0] > 0) {
      const owner = gameState.players[ownerIdx];
      const houseCount = owner.houses?.[landedCell.id] ?? 0;
      const rentIdx = Math.min(houseCount, landedCell.rent.length - 1);
      const rentAmount = landedCell.rent[rentIdx];
      const ownerName = t(`players.${owner.nameKey}`);

      workingPlayers = workingPlayers.map((p, idx) => {
        if (idx === gameState.currentPlayer) return { ...p, money: p.money - rentAmount };
        if (idx === ownerIdx) return { ...p, money: p.money + rentAmount };
        return p;
      });

      workingLog = [...workingLog, makeLog('log.playerPaidRent', 'warning', {
        player: playerName, amount: rentAmount, owner: ownerName,
      })];

      toast({
        title: t('game.payRent'),
        description: `${playerName} → ${rentAmount.toLocaleString()}₽ → ${ownerName}`,
      });

      const result = advanceAfterDebit(workingPlayers, workingLog, gameState.currentPlayer, gameState.round, gameState.maxRounds);
      setGameState({
        ...gameState, dice: [dice1, dice2], lastRoll: [dice1, dice2],
        players: result.players, gameLog: result.log,
        phase: result.nextPhase, currentPlayer: result.nextCurrentPlayer,
        round: result.nextRound, doubleCount: newDoubleCount,
      });
      return;
    }

    // ── DEFAULT: show landed cell ─────────────────────────────────────────────
    setGameState({
      ...gameState,
      dice: [dice1, dice2],
      lastRoll: [dice1, dice2],
      players: workingPlayers,
      gameLog: workingLog,
      phase: 'landed',
      doubleCount: newDoubleCount,
    });
  }, [gameState, toast, t, makeLog, advanceAfterDebit]);

  const payJailFine = useCallback(() => {
    if (!gameState || gameState.phase !== 'rolling') return;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (!currentPlayer.inJail) return;

    if (currentPlayer.money < JAIL_FINE) {
      toast({ title: 'Недостаточно денег для залога', variant: 'destructive' });
      return;
    }

    const playerName = t(`players.${currentPlayer.nameKey}`);
    const updatedPlayers = gameState.players.map((p, idx) =>
      idx === gameState.currentPlayer ? { ...p, money: p.money - JAIL_FINE, inJail: false, jailTurns: 0 } : p
    );
    const newLog: LogEntry[] = [
      ...gameState.gameLog,
      makeLog('log.paidJailFine', 'warning', { player: playerName, amount: JAIL_FINE }),
    ];

    setGameState({ ...gameState, players: updatedPlayers, gameLog: newLog });
    toast({ title: 'Залог оплачен', description: `${JAIL_FINE.toLocaleString()}₽ — теперь бросайте кубики` });
  }, [gameState, toast, t, makeLog]);

  const buildHouse = useCallback((cellId: number) => {
    if (!gameState) return;
    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (!currentPlayer.properties.includes(cellId)) return;

    const cell = BOARD_CELLS[cellId];
    if (!cell.houseCost) return;

    const currentCount = currentPlayer.houses?.[cellId] ?? 0;
    if (currentCount >= MAX_HOUSES) {
      toast({ title: 'Максимум построек', variant: 'destructive' });
      return;
    }

    if (currentPlayer.money < cell.houseCost) {
      toast({ title: 'Недостаточно денег', variant: 'destructive' });
      return;
    }

    const playerName = t(`players.${currentPlayer.nameKey}`);
    const propertyName = t(`cells.${cell.nameKey}`);
    const newCount = currentCount + 1;

    const updatedPlayers = gameState.players.map((p, idx) =>
      idx === gameState.currentPlayer
        ? {
            ...p,
            money: p.money - cell.houseCost!,
            houses: { ...(p.houses ?? {}), [cellId]: newCount },
          }
        : p
    );

    const newLog: LogEntry[] = [
      ...gameState.gameLog,
      makeLog('log.builtHouse', 'success', {
        player: playerName,
        property: propertyName,
        count: newCount,
        price: cell.houseCost,
      }),
    ];

    setGameState({ ...gameState, players: updatedPlayers, gameLog: newLog });

    toast({
      title: newCount === MAX_HOUSES ? '🏨 Отель построен!' : `🏠 Дом ${newCount}/4 построен`,
      description: `${propertyName} — ${cell.houseCost.toLocaleString()}₽`,
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
        const parsed = JSON.parse(saved) as GameState;
        // Migrate stale saves: ensure each player has a `houses` map.
        parsed.players = parsed.players.map((p) =>
          p.houses ? p : { ...p, houses: {} }
        );
        setGameState(parsed);
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
        payJailFine,
        buildHouse,
        cells: BOARD_CELLS,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
