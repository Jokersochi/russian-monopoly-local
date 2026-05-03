import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState, Player, Cell, GamePhase, AuctionState, ChanceCard, LogEntry } from '@/types/game';
import { BOARD_CELLS, PLAYER_TOKENS, CHANCE_CARDS, TRIAL_CARDS } from '@/data/board';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from '@/contexts/LocaleContext';

export interface GameInitOptions {
  playerNames?: string[];
  maxRounds?: number;
  startingMoney?: number;
}

interface GameContextType {
  gameState: GameState | null;
  initGame: (playerCount: number, options?: GameInitOptions) => void;
  rollDice: () => void;
  buyProperty: () => void;
  passProperty: () => void;
  endTurn: () => void;
  placeBid: (amount: number) => void;
  passBid: () => void;
  payBail: () => void;
  useJailCard: () => void;
  dismissCard: () => void;
  buyHouse: (cellId: number) => void;
  mortgageProperty: (cellId: number) => void;
  unmortgageProperty: (cellId: number) => void;
  cells: Cell[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};

const STARTING_MONEY = 15_000_000;
const START_BONUS = 2_000_000;
const JAIL_POSITION = 10;
const BAIL_COST = 500_000;
const TAX_AMOUNTS: Record<number, number> = { 4: 2_000_000, 38: 1_500_000 };
const TRANSPORT_RENT = [250_000, 500_000, 1_000_000, 2_000_000];

function makeLog(
  textKey: string,
  params: Record<string, string | number>,
  type: LogEntry['type']
): LogEntry {
  return { id: Date.now() + Math.random(), textKey, params, type, timestamp: Date.now() };
}

function calcRent(cell: Cell, owner: Player, diceSum: number, houses: Record<number, number>): number {
  if (!cell.rent) return 0;

  if (cell.type === 'transport') {
    const count = owner.properties.filter(pid => BOARD_CELLS[pid]?.type === 'transport').length;
    return TRANSPORT_RENT[Math.min(count - 1, 3)];
  }

  if (cell.type === 'utility') {
    const count = owner.properties.filter(pid => BOARD_CELLS[pid]?.type === 'utility').length;
    return count >= 2 ? diceSum * 100_000 : diceSum * 40_000;
  }

  const houseCount = houses[cell.id] || 0;
  if (houseCount > 0) {
    const rentIdx = Math.min(houseCount, (cell.rent.length || 1) - 1);
    return cell.rent[rentIdx];
  }

  const sameColor = BOARD_CELLS.filter(c => c.color && c.color === cell.color);
  const ownsAll = sameColor.length > 0 && sameColor.every(c => owner.properties.includes(c.id));
  const base = cell.rent[0];
  return ownsAll ? base * 2 : base;
}

function findNextBidder(
  participants: number[],
  current: number,
  passed: number[]
): number | null {
  const idx = participants.indexOf(current);
  for (let i = 1; i <= participants.length; i++) {
    const next = participants[(idx + i) % participants.length];
    if (!passed.includes(next)) return next;
  }
  return null;
}

function advanceAfterAction(
  state: GameState,
  goToJailOverride?: boolean
): Partial<GameState> {
  if (goToJailOverride) {
    const nextIdx = (state.currentPlayer + 1) % state.players.length;
    const newRound = nextIdx === 0 ? state.round + 1 : state.round;
    if (newRound > state.maxRounds) return { currentPlayer: nextIdx, round: newRound, phase: 'game-over', doubleCount: 0 };
    const nextPl = state.players[nextIdx];
    return { currentPlayer: nextIdx, round: newRound, phase: nextPl.inJail ? 'jail' : 'rolling', doubleCount: 0 };
  }

  const wasDouble = state.dice[0] === state.dice[1] && state.doubleCount > 0;
  if (wasDouble) return { phase: 'rolling' };

  const nextIdx = (state.currentPlayer + 1) % state.players.length;
  const newRound = nextIdx === 0 ? state.round + 1 : state.round;
  if (newRound > state.maxRounds) return { currentPlayer: nextIdx, round: newRound, phase: 'game-over', doubleCount: 0 };
  const nextPl = state.players[nextIdx];
  return { currentPlayer: nextIdx, round: newRound, phase: nextPl.inJail ? 'jail' : 'rolling', doubleCount: 0 };
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const { toast } = useToast();
  const { t } = useLocale();

  const pname = (p: Player) => p.displayName || t(`players.${p.nameKey}`);
  const cname = (c: Cell) => t(`cells.${c.nameKey}`);

  const initGame = useCallback((playerCount: number, options?: GameInitOptions) => {
    const startMoney = options?.startingMoney ?? STARTING_MONEY;
    const rounds = options?.maxRounds ?? 50;
    const players: Player[] = Array.from({ length: playerCount }, (_, i) => ({
      id: i,
      nameKey: `player${i + 1}`,
      displayName: options?.playerNames?.[i] || undefined,
      token: PLAYER_TOKENS[i].icon,
      money: startMoney,
      position: 0,
      properties: [],
      mortgaged: [],
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
      maxRounds: rounds,
      houses: {},
    });

    toast({ title: 'Игра началась!', description: `${playerCount} игроков. Удачи!` });
  }, [toast]);

  const rollDice = useCallback(() => {
    if (!gameState) return;
    if (gameState.phase !== 'rolling' && gameState.phase !== 'jail') return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;
    const isDouble = dice1 === dice2;

    const logs: LogEntry[] = [];
    const log = (key: string, params: Record<string, string | number>, type: LogEntry['type'] = 'info') =>
      logs.push(makeLog(key, params, type));

    const player = gameState.players[gameState.currentPlayer];

    // ---- JAIL ROLL ----
    if (player.inJail) {
      log('log.playerRolled', { player: pname(player), dice: `${dice1}+${dice2}=${sum}` });

      if (isDouble) {
        log('log.playerReleasedFromJail', { player: pname(player) }, 'success');
        const newPos = (player.position + sum) % 40;
        const updatedPlayers = gameState.players.map((p, i) =>
          i === gameState.currentPlayer ? { ...p, inJail: false, jailTurns: 0, position: newPos } : p
        );
        const baseState: GameState = {
          ...gameState,
          dice: [dice1, dice2],
          lastRoll: [dice1, dice2],
          players: updatedPlayers,
          doubleCount: 0,
          phase: 'landed',
          gameLog: [...gameState.gameLog, ...logs],
        };
        setGameState(resolveLanding(baseState, newPos, sum, false));
        return;
      }

      const newJailTurns = player.jailTurns + 1;

      if (newJailTurns >= 3) {
        log('log.playerForcedBail', { player: pname(player) }, 'warning');
        const newPos = (JAIL_POSITION + sum) % 40;
        const updatedPlayers = gameState.players.map((p, i) =>
          i === gameState.currentPlayer
            ? { ...p, inJail: false, jailTurns: 0, money: p.money - BAIL_COST, position: newPos }
            : p
        );
        const baseState: GameState = {
          ...gameState,
          dice: [dice1, dice2],
          lastRoll: [dice1, dice2],
          players: updatedPlayers,
          doubleCount: 0,
          phase: 'landed',
          gameLog: [...gameState.gameLog, ...logs],
        };
        const resolved = resolveLanding(baseState, newPos, sum, false);
        if (resolved.players[gameState.currentPlayer]?.money < 0) {
          setGameState(handleBankruptcy(resolved));
        } else {
          setGameState(resolved);
        }
        return;
      }

      log('log.playerStillInJail', { player: pname(player), turns: newJailTurns }, 'warning');
      const updatedPlayers = gameState.players.map((p, i) =>
        i === gameState.currentPlayer ? { ...p, jailTurns: newJailTurns } : p
      );
      const nextIdx = (gameState.currentPlayer + 1) % updatedPlayers.length;
      const newRound = nextIdx === 0 ? gameState.round + 1 : gameState.round;
      const nextPl = updatedPlayers[nextIdx];
      setGameState({
        ...gameState,
        dice: [dice1, dice2],
        lastRoll: [dice1, dice2],
        players: updatedPlayers,
        currentPlayer: nextIdx,
        round: newRound,
        phase: newRound > gameState.maxRounds ? 'game-over' : (nextPl.inJail ? 'jail' : 'rolling'),
        doubleCount: 0,
        gameLog: [...gameState.gameLog, ...logs],
      });
      return;
    }

    // ---- NORMAL ROLL ----
    const newDoubleCount = isDouble ? gameState.doubleCount + 1 : 0;

    if (isDouble && newDoubleCount >= 3) {
      log('log.playerThreeDoubles', { player: pname(player) }, 'warning');
      log('log.playerJailed', { player: pname(player) }, 'warning');
      const updatedPlayers = gameState.players.map((p, i) =>
        i === gameState.currentPlayer ? { ...p, position: JAIL_POSITION, inJail: true, jailTurns: 0 } : p
      );
      const nextIdx = (gameState.currentPlayer + 1) % updatedPlayers.length;
      const newRound = nextIdx === 0 ? gameState.round + 1 : gameState.round;
      const nextPl = updatedPlayers[nextIdx];
      setGameState({
        ...gameState,
        dice: [dice1, dice2],
        lastRoll: [dice1, dice2],
        players: updatedPlayers,
        doubleCount: 0,
        currentPlayer: nextIdx,
        round: newRound,
        phase: newRound > gameState.maxRounds ? 'game-over' : (nextPl.inJail ? 'jail' : 'rolling'),
        gameLog: [...gameState.gameLog, ...logs],
      });
      return;
    }

    const newPosition = (player.position + sum) % 40;
    const passedStart = player.position + sum >= 40;

    log('log.playerRolled', { player: pname(player), dice: `${dice1}+${dice2}=${sum}` });
    if (isDouble) log('log.playerDouble', { player: pname(player) }, 'success');

    let updatedPlayers = gameState.players.map((p, i) =>
      i === gameState.currentPlayer
        ? { ...p, position: newPosition, money: passedStart ? p.money + START_BONUS : p.money }
        : p
    );
    if (passedStart) log('log.passedStart', { player: pname(player), amount: START_BONUS.toLocaleString() }, 'success');

    const baseState: GameState = {
      ...gameState,
      dice: [dice1, dice2],
      lastRoll: [dice1, dice2],
      players: updatedPlayers,
      doubleCount: newDoubleCount,
      phase: 'landed',
      gameLog: [...gameState.gameLog, ...logs],
    };

    setGameState(resolveLanding(baseState, newPosition, sum, isDouble));

    toast({ title: `🎲 ${dice1} + ${dice2} = ${sum}`, description: isDouble ? '🎯 Дубль!' : undefined });
  }, [gameState, t]);

  function resolveLanding(state: GameState, position: number, diceSum: number, isDouble: boolean): GameState {
    const cell = BOARD_CELLS[position];
    const player = state.players[state.currentPlayer];
    const logs: LogEntry[] = [];
    const log = (key: string, params: Record<string, string | number>, type: LogEntry['type'] = 'info') =>
      logs.push(makeLog(key, params, type));

    const appendLogs = (s: GameState): GameState => ({
      ...s,
      gameLog: [...s.gameLog, ...logs],
    });

    if (cell.type === 'go-to-jail') {
      log('log.playerJailed', { player: pname(player) }, 'warning');
      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayer ? { ...p, position: JAIL_POSITION, inJail: true, jailTurns: 0 } : p
      );
      const next = advanceAfterAction({ ...state, players: updatedPlayers }, true);
      return appendLogs({ ...state, players: updatedPlayers, ...next });
    }

    if (cell.type === 'tax') {
      const taxAmount = TAX_AMOUNTS[position] || 1_000_000;
      log('log.playerPaidTax', { player: pname(player), amount: taxAmount.toLocaleString('ru-RU') }, 'warning');
      const updatedPlayers = state.players.map((p, i) =>
        i === state.currentPlayer ? { ...p, money: p.money - taxAmount } : p
      );
      const newState = { ...state, players: updatedPlayers };
      if (updatedPlayers[state.currentPlayer].money < 0) {
        return appendLogs(handleBankruptcy(newState));
      }
      const next = advanceAfterAction(newState);
      return appendLogs({ ...newState, ...next });
    }

    if (cell.type === 'chance' || cell.type === 'trial') {
      const deck = cell.type === 'chance' ? CHANCE_CARDS : TRIAL_CARDS;
      const card = deck[Math.floor(Math.random() * deck.length)] as ChanceCard;
      log('log.drewCard', { player: pname(player), card: t(`cards.${card.textKey}`) });
      return appendLogs({ ...state, phase: 'card-draw', currentCard: card });
    }

    if (cell.type === 'city' || cell.type === 'transport' || cell.type === 'utility') {
      if (!cell.price) {
        const next = advanceAfterAction(state);
        return appendLogs({ ...state, ...next });
      }

      const ownerIdx = state.players.findIndex(p => p.properties.includes(cell.id));

      if (ownerIdx >= 0 && ownerIdx !== state.currentPlayer) {
        const owner = state.players[ownerIdx];
        if (owner.mortgaged.includes(cell.id)) {
          const next = advanceAfterAction(state);
          return appendLogs({ ...state, ...next });
        }
        const rent = calcRent(cell, owner, diceSum, state.houses);
        log('log.playerPaidRent', {
          player: pname(player),
          amount: rent.toLocaleString('ru-RU'),
          owner: pname(owner),
        }, 'warning');
        const updatedPlayers = state.players.map((p, i) => {
          if (i === state.currentPlayer) return { ...p, money: p.money - rent };
          if (i === ownerIdx) return { ...p, money: p.money + rent };
          return p;
        });
        const newState = { ...state, players: updatedPlayers, phase: 'paying-rent' as GamePhase };
        if (updatedPlayers[state.currentPlayer].money < 0) {
          return appendLogs(handleBankruptcy(newState));
        }
        return appendLogs(newState);
      }

      return appendLogs({ ...state, phase: 'landed' });
    }

    const next = advanceAfterAction(state);
    return appendLogs({ ...state, ...next });
  }

  function handleBankruptcy(state: GameState): GameState {
    const playerIdx = state.currentPlayer;
    const bankrupt = state.players[playerIdx];
    const logEntry = makeLog('log.playerBankrupt', { player: pname(bankrupt) }, 'error');
    const newPlayers = state.players.filter((_, i) => i !== playerIdx);
    const newLog = [...state.gameLog, logEntry];

    if (newPlayers.length <= 1) {
      const winner = newPlayers[0];
      const winLog = winner
        ? makeLog('log.gameWon', { player: pname(winner), money: winner.money.toLocaleString('ru-RU') }, 'success')
        : logEntry;
      toast({ title: winner ? `🏆 ${pname(winner)} победил!` : 'Конец игры!' });
      return { ...state, players: newPlayers, phase: 'game-over', gameLog: winner ? [...newLog, winLog] : newLog };
    }

    const nextIdx = playerIdx % newPlayers.length;
    const nextPl = newPlayers[nextIdx];
    toast({ title: `💸 ${pname(bankrupt)} обанкротился!`, variant: 'destructive' });
    return {
      ...state,
      players: newPlayers,
      currentPlayer: nextIdx,
      phase: nextPl.inJail ? 'jail' : 'rolling',
      doubleCount: 0,
      gameLog: newLog,
    };
  }

  const buyProperty = useCallback(() => {
    if (!gameState || gameState.phase !== 'landed') return;

    const player = gameState.players[gameState.currentPlayer];
    const cell = BOARD_CELLS[player.position];
    if (!cell.price) return;

    if (player.money < cell.price) {
      toast({ title: 'Недостаточно денег', variant: 'destructive' });
      return;
    }

    const log = makeLog('log.playerBought', {
      player: pname(player),
      property: cname(cell),
      price: cell.price.toLocaleString('ru-RU'),
    }, 'success');

    const updatedPlayers = gameState.players.map((p, i) =>
      i === gameState.currentPlayer
        ? { ...p, money: p.money - cell.price!, properties: [...p.properties, cell.id] }
        : p
    );

    const newState = { ...gameState, players: updatedPlayers, gameLog: [...gameState.gameLog, log] };
    const next = advanceAfterAction(newState);

    setGameState({ ...newState, ...next });
    toast({ title: `✅ Куплено!`, description: `${cname(cell)} за ${(cell.price / 1_000).toFixed(0)}K₽` });
  }, [gameState, t]);

  const passProperty = useCallback(() => {
    if (!gameState || gameState.phase !== 'landed') return;

    const player = gameState.players[gameState.currentPlayer];
    const cell = BOARD_CELLS[player.position];

    const otherPlayers = gameState.players
      .map((_, i) => i)
      .filter(i => i !== gameState.currentPlayer);

    if (otherPlayers.length === 0) {
      const next = advanceAfterAction(gameState);
      setGameState({ ...gameState, ...next });
      return;
    }

    const firstBidder = otherPlayers[(gameState.currentPlayer) % otherPlayers.length] ?? otherPlayers[0];
    const log = makeLog('log.playerPassed', { player: pname(player), property: cname(cell) }, 'info');
    const auctionLog = makeLog('log.auctionStarted', { property: cname(cell) }, 'info');

    const auctionState: AuctionState = {
      cellId: cell.id,
      currentBid: 0,
      highBidder: null,
      currentBidder: firstBidder,
      participants: otherPlayers,
      passedPlayers: [],
    };

    setGameState({
      ...gameState,
      phase: 'auction',
      auctionState,
      gameLog: [...gameState.gameLog, log, auctionLog],
    });
  }, [gameState, t]);

  const placeBid = useCallback((amount: number) => {
    if (!gameState || gameState.phase !== 'auction' || !gameState.auctionState) return;

    const { auctionState } = gameState;
    const bidder = gameState.players[auctionState.currentBidder];
    const cell = BOARD_CELLS[auctionState.cellId];

    if (amount <= auctionState.currentBid) {
      toast({ title: 'Ставка должна быть выше текущей!', variant: 'destructive' });
      return;
    }

    const log = makeLog('log.auctionBid', {
      player: pname(bidder),
      amount: amount.toLocaleString('ru-RU'),
      property: cname(cell),
    }, 'success');

    const newAuction: AuctionState = {
      ...auctionState,
      currentBid: amount,
      highBidder: auctionState.currentBidder,
    };

    const remaining = newAuction.participants.filter(p => !newAuction.passedPlayers.includes(p));
    const next = findNextBidder(remaining, newAuction.currentBidder, newAuction.passedPlayers);

    if (next === null || next === newAuction.highBidder) {
      endAuction(newAuction, gameState);
      return;
    }

    setGameState({
      ...gameState,
      auctionState: { ...newAuction, currentBidder: next },
      gameLog: [...gameState.gameLog, log],
    });
  }, [gameState, t]);

  const passBid = useCallback(() => {
    if (!gameState || gameState.phase !== 'auction' || !gameState.auctionState) return;

    const { auctionState } = gameState;
    const bidder = gameState.players[auctionState.currentBidder];
    const cell = BOARD_CELLS[auctionState.cellId];

    const log = makeLog('log.auctionPassedBid', { player: pname(bidder) }, 'info');
    const newPassed = [...auctionState.passedPlayers, auctionState.currentBidder];
    const remaining = auctionState.participants.filter(p => !newPassed.includes(p));

    const newAuction: AuctionState = { ...auctionState, passedPlayers: newPassed };

    if (remaining.length === 0) {
      const noBidLog = makeLog('log.auctionNoBids', { property: cname(cell) }, 'info');
      const next = advanceAfterAction(gameState);
      setGameState({
        ...gameState,
        phase: next.phase as GamePhase,
        currentPlayer: next.currentPlayer ?? gameState.currentPlayer,
        round: next.round ?? gameState.round,
        doubleCount: next.doubleCount ?? gameState.doubleCount,
        auctionState: undefined,
        gameLog: [...gameState.gameLog, log, noBidLog],
      });
      return;
    }

    if (remaining.length === 1 && newAuction.highBidder !== null && auctionState.currentBid > 0) {
      endAuction(newAuction, gameState, [...gameState.gameLog, log]);
      return;
    }

    const nextBidder = findNextBidder(auctionState.participants, auctionState.currentBidder, newPassed);
    setGameState({
      ...gameState,
      auctionState: { ...newAuction, currentBidder: nextBidder! },
      gameLog: [...gameState.gameLog, log],
    });
  }, [gameState, t]);

  function endAuction(auction: AuctionState, state: GameState, prefixLogs?: LogEntry[]) {
    const cell = BOARD_CELLS[auction.cellId];
    const extraLogs: LogEntry[] = prefixLogs ?? [];

    if (auction.highBidder === null || auction.currentBid === 0) {
      const noBidLog = makeLog('log.auctionNoBids', { property: cname(cell) }, 'info');
      const next = advanceAfterAction(state);
      setGameState({
        ...state,
        ...next,
        auctionState: undefined,
        gameLog: [...state.gameLog, ...extraLogs, noBidLog],
      });
      return;
    }

    const winner = state.players[auction.highBidder];
    const winLog = makeLog('log.auctionWon', {
      player: pname(winner),
      property: cname(cell),
      price: auction.currentBid.toLocaleString('ru-RU'),
    }, 'success');

    const updatedPlayers = state.players.map((p, i) =>
      i === auction.highBidder
        ? { ...p, money: p.money - auction.currentBid, properties: [...p.properties, auction.cellId] }
        : p
    );

    const newState = { ...state, players: updatedPlayers };
    if (updatedPlayers[auction.highBidder].money < 0) {
      setGameState(handleBankruptcy({ ...newState, gameLog: [...state.gameLog, ...extraLogs, winLog] }));
      return;
    }

    const next = advanceAfterAction(newState);
    setGameState({
      ...newState,
      ...next,
      auctionState: undefined,
      gameLog: [...state.gameLog, ...extraLogs, winLog],
    });

    toast({ title: `🏆 ${pname(winner)} выиграл аукцион!`, description: `${cname(cell)} за ${(auction.currentBid / 1_000).toFixed(0)}K₽` });
  }

  const endTurn = useCallback(() => {
    if (!gameState) return;

    const next = advanceAfterAction(gameState);
    setGameState({ ...gameState, ...next, phase: (next.phase ?? 'rolling') as GamePhase });
  }, [gameState]);

  const payBail = useCallback(() => {
    if (!gameState) return;
    const player = gameState.players[gameState.currentPlayer];
    if (!player.inJail) return;
    if (player.money < BAIL_COST) {
      toast({ title: 'Недостаточно денег для залога!', variant: 'destructive' });
      return;
    }

    const log = makeLog('log.playerPaysBail', { player: pname(player), amount: BAIL_COST.toLocaleString('ru-RU') }, 'info');
    const updatedPlayers = gameState.players.map((p, i) =>
      i === gameState.currentPlayer ? { ...p, inJail: false, jailTurns: 0, money: p.money - BAIL_COST } : p
    );

    setGameState({
      ...gameState,
      players: updatedPlayers,
      phase: 'rolling',
      gameLog: [...gameState.gameLog, log],
    });
  }, [gameState, t]);

  const useJailCard = useCallback(() => {
    if (!gameState) return;
    const player = gameState.players[gameState.currentPlayer];
    if (!player.inJail || player.getOutOfJailCards <= 0) return;

    const log = makeLog('log.playerReleasedFromJail', { player: pname(player) }, 'success');
    const updatedPlayers = gameState.players.map((p, i) =>
      i === gameState.currentPlayer
        ? { ...p, inJail: false, jailTurns: 0, getOutOfJailCards: p.getOutOfJailCards - 1 }
        : p
    );

    setGameState({
      ...gameState,
      players: updatedPlayers,
      phase: 'rolling',
      gameLog: [...gameState.gameLog, log],
    });
  }, [gameState, t]);

  const dismissCard = useCallback(() => {
    if (!gameState || gameState.phase !== 'card-draw' || !gameState.currentCard) return;

    const card = gameState.currentCard;
    const effect = card.effect;
    const player = gameState.players[gameState.currentPlayer];
    let updatedPlayers = [...gameState.players];
    const logs: LogEntry[] = [];
    const log = (key: string, params: Record<string, string | number>, type: LogEntry['type'] = 'info') =>
      logs.push(makeLog(key, params, type));

    let newPosition = player.position;

    if (effect.money !== undefined) {
      updatedPlayers = updatedPlayers.map((p, i) =>
        i === gameState.currentPlayer ? { ...p, money: p.money + effect.money! } : p
      );
    }

    if (effect.taxPerProperty !== undefined) {
      const tax = effect.taxPerProperty > 0
        ? effect.taxPerProperty * player.properties.length
        : Math.abs(effect.taxPerProperty) * player.properties.reduce((s, pid) => s + (BOARD_CELLS[pid]?.price || 0), 0);
      updatedPlayers = updatedPlayers.map((p, i) =>
        i === gameState.currentPlayer ? { ...p, money: p.money - tax } : p
      );
    }

    if (effect.collectFromPlayers !== undefined) {
      const amount = effect.collectFromPlayers;
      const total = amount * (gameState.players.length - 1);
      updatedPlayers = updatedPlayers.map((p, i) => {
        if (i === gameState.currentPlayer) return { ...p, money: p.money + total };
        return { ...p, money: p.money - amount };
      });
    }

    if (effect.payToPlayers !== undefined) {
      const amount = effect.payToPlayers;
      const total = amount * (gameState.players.length - 1);
      updatedPlayers = updatedPlayers.map((p, i) => {
        if (i === gameState.currentPlayer) return { ...p, money: p.money - total };
        return { ...p, money: p.money + amount };
      });
    }

    if (effect.getOutOfJail) {
      updatedPlayers = updatedPlayers.map((p, i) =>
        i === gameState.currentPlayer ? { ...p, getOutOfJailCards: p.getOutOfJailCards + 1 } : p
      );
    }

    if (effect.moveToCell !== undefined) {
      newPosition = effect.moveToCell;
      const targetCell = BOARD_CELLS[newPosition];
      const jailByCard = targetCell?.type === 'jail';
      updatedPlayers = updatedPlayers.map((p, i) =>
        i === gameState.currentPlayer
          ? { ...p, position: newPosition, inJail: jailByCard ? true : p.inJail, jailTurns: jailByCard ? 0 : p.jailTurns }
          : p
      );
    }

    const newState: GameState = {
      ...gameState,
      players: updatedPlayers,
      currentCard: undefined,
      phase: 'landed',
      gameLog: [...gameState.gameLog, ...logs],
    };

    if (updatedPlayers[gameState.currentPlayer].money < 0) {
      setGameState(handleBankruptcy(newState));
      return;
    }

    const next = advanceAfterAction(newState);
    setGameState({ ...newState, ...next });
  }, [gameState, t]);

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

  const buyHouse = useCallback((cellId: number) => {
    if (!gameState || gameState.phase !== 'rolling') return;

    const player = gameState.players[gameState.currentPlayer];
    if (!player.properties.includes(cellId)) return;

    const cell = BOARD_CELLS[cellId];
    if (!cell.houseCost || cell.type !== 'city') return;

    const currentHouses = gameState.houses[cellId] || 0;
    if (currentHouses >= 5) {
      toast({ title: 'Максимум домов достигнут (5 = отель)', variant: 'destructive' });
      return;
    }

    const sameColor = BOARD_CELLS.filter(c => c.color && c.color === cell.color);
    const ownsAll = sameColor.every(c => player.properties.includes(c.id));
    if (!ownsAll) {
      toast({ title: 'Нужно владеть всеми объектами цвета!', variant: 'destructive' });
      return;
    }

    if (player.money < cell.houseCost) {
      toast({ title: 'Недостаточно денег для строительства!', variant: 'destructive' });
      return;
    }

    const newHouseCount = currentHouses + 1;
    const label = newHouseCount === 5 ? 'отель' : `${newHouseCount} ${newHouseCount === 1 ? 'дом' : 'дома'}`;
    const log = makeLog('log.playerBought', {
      player: pname(player),
      property: `${t(`cells.${cell.nameKey}`)} (${label})`,
      price: cell.houseCost.toLocaleString('ru-RU'),
    }, 'success');

    const updatedPlayers = gameState.players.map((p, i) =>
      i === gameState.currentPlayer ? { ...p, money: p.money - cell.houseCost! } : p
    );

    setGameState({
      ...gameState,
      players: updatedPlayers,
      houses: { ...gameState.houses, [cellId]: newHouseCount },
      gameLog: [...gameState.gameLog, log],
    });

    toast({ title: `🏠 Построено!`, description: `${t(`cells.${cell.nameKey}`)}: ${label}` });
  }, [gameState, t]);

  const mortgageProperty = useCallback((cellId: number) => {
    if (!gameState || gameState.phase !== 'rolling') return;

    const player = gameState.players[gameState.currentPlayer];
    if (!player.properties.includes(cellId)) return;
    if (player.mortgaged.includes(cellId)) return;

    const cell = BOARD_CELLS[cellId];
    if (!cell.price) return;

    const mortgageValue = Math.floor(cell.price / 2);
    const log = makeLog('log.playerMortgaged', {
      player: pname(player),
      property: t(`cells.${cell.nameKey}`),
      amount: mortgageValue.toLocaleString('ru-RU'),
    }, 'info');

    setGameState({
      ...gameState,
      players: gameState.players.map((p, i) =>
        i === gameState.currentPlayer
          ? { ...p, money: p.money + mortgageValue, mortgaged: [...p.mortgaged, cellId] }
          : p
      ),
      gameLog: [...gameState.gameLog, log],
    });

    toast({ title: t('game.mortgage'), description: `+${mortgageValue.toLocaleString('ru-RU')}₽` });
  }, [gameState, t]);

  const unmortgageProperty = useCallback((cellId: number) => {
    if (!gameState || gameState.phase !== 'rolling') return;

    const player = gameState.players[gameState.currentPlayer];
    if (!player.mortgaged.includes(cellId)) return;

    const cell = BOARD_CELLS[cellId];
    if (!cell.price) return;

    const redemptionCost = Math.floor(cell.price / 2 * 1.1);
    if (player.money < redemptionCost) {
      toast({ title: 'Недостаточно денег для выкупа!', variant: 'destructive' });
      return;
    }

    const log = makeLog('log.playerUnmortgaged', {
      player: pname(player),
      property: t(`cells.${cell.nameKey}`),
      amount: redemptionCost.toLocaleString('ru-RU'),
    }, 'info');

    setGameState({
      ...gameState,
      players: gameState.players.map((p, i) =>
        i === gameState.currentPlayer
          ? { ...p, money: p.money - redemptionCost, mortgaged: p.mortgaged.filter(id => id !== cellId) }
          : p
      ),
      gameLog: [...gameState.gameLog, log],
    });

    toast({ title: t('game.unmortgage'), description: `-${redemptionCost.toLocaleString('ru-RU')}₽` });
  }, [gameState, t]);

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
        placeBid,
        passBid,
        payBail,
        useJailCard,
        dismissCard,
        buyHouse,
        mortgageProperty,
        unmortgageProperty,
        cells: BOARD_CELLS,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
