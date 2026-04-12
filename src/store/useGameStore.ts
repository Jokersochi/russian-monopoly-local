import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, Player, Cell, LogEntry, GamePhase } from '@/types/game';
import { BOARD_CELLS, PLAYER_TOKENS } from '@/data/board';
import { diceService } from '@/services/diceService';
import { gameService } from '@/services/gameService';
import { GameStateSchema } from '@/schemas/game';
import { toast } from 'sonner';

const STARTING_MONEY = 15000000;
const START_BONUS = 2000000;

interface GameStore {
  gameState: GameState | null;
  initGame: (playerCount: number) => void;
  rollDice: () => void;
  buyProperty: () => void;
  passProperty: () => void;
  endTurn: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      gameState: null,

      initGame: (playerCount) => {
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

        const initialState: GameState = {
          players,
          currentPlayer: 0,
          dice: [1, 1],
          phase: 'rolling',
          lastRoll: null,
          doubleCount: 0,
          gameLog: [
            gameService.createLogEntry('log.gameStarted', 'info', { count: playerCount })
          ],
          round: 1,
          maxRounds: 50,
        };

        set({ gameState: initialState });
        toast.success(`Игра началась! ${playerCount} игроков.`);
      },

      rollDice: () => {
        const { gameState } = get();
        if (!gameState || gameState.phase !== 'rolling') return;

        const [dice1, dice2] = diceService.rollDice();
        const sum = dice1 + dice2;
        const isDouble = dice1 === dice2;

        const currentPlayer = gameState.players[gameState.currentPlayer];
        const { newPosition, passedStart } = gameService.calculateMovement(currentPlayer.position, sum);

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

        const newLogEntry = gameService.createLogEntry('log.diceRoll', 'info', {
          player: currentPlayer.token,
          dice1,
          dice2,
          sum
        });

        set({
          gameState: {
            ...gameState,
            dice: [dice1, dice2],
            lastRoll: [dice1, dice2],
            players: updatedPlayers,
            phase: 'landed',
            doubleCount: isDouble ? gameState.doubleCount + 1 : 0,
            gameLog: [...gameState.gameLog, newLogEntry],
          },
        });

        toast(`Выброшено: ${dice1} + ${dice2} = ${sum}`, {
          description: isDouble ? "Дубль!" : undefined,
        });
      },

      buyProperty: () => {
        const { gameState } = get();
        if (!gameState || gameState.phase !== 'landed') return;

        const currentPlayer = gameState.players[gameState.currentPlayer];
        const cell = gameService.getCell(currentPlayer.position);

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

          const newLogEntry = gameService.createLogEntry('log.propertyBought', 'success', {
            player: currentPlayer.token,
            property: cell.nameKey,
            price: cell.price
          });

          set({
            gameState: {
              ...gameState,
              players: updatedPlayers,
              phase: 'rolling',
              currentPlayer: gameService.getNextPlayerIndex(updatedPlayers, gameState.currentPlayer),
              gameLog: [...gameState.gameLog, newLogEntry],
            },
          });

          toast.success(`Куплено: ${cell.nameKey} за ${cell.price}₽`);
        } else {
          toast.error("Недостаточно денег");
        }
      },

      passProperty: () => {
        const { gameState } = get();
        if (!gameState || gameState.phase !== 'landed') return;

        const currentPlayer = gameState.players[gameState.currentPlayer];
        const newLogEntry = gameService.createLogEntry('log.propertyPassed', 'info', {
          player: currentPlayer.token
        });

        set({
          gameState: {
            ...gameState,
            phase: 'rolling',
            currentPlayer: gameService.getNextPlayerIndex(gameState.players, gameState.currentPlayer),
            gameLog: [...gameState.gameLog, newLogEntry],
          },
        });

        toast("Пропуск покупки");
      },

      endTurn: () => {
        const { gameState } = get();
        if (!gameState) return;

        const nextPlayer = gameService.getNextPlayerIndex(gameState.players, gameState.currentPlayer);
        const newRound = nextPlayer === 0 ? gameState.round + 1 : gameState.round;

        set({
          gameState: {
            ...gameState,
            currentPlayer: nextPlayer,
            phase: 'rolling',
            round: newRound,
          },
        });
      },

      resetGame: () => {
        set({ gameState: null });
        localStorage.removeItem('russian-monopoly-storage');
      }
    }),
    {
      name: 'russian-monopoly-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('An error occurred during rehydration', error);
          } else if (rehydratedState && rehydratedState.gameState) {
            // Validate rehydrated state with Zod
            const result = GameStateSchema.safeParse(rehydratedState.gameState);
            if (!result.success) {
              console.error('Invalid state detected during rehydration', result.error);
              // You might want to reset the state or handle it gracefully
              // rehydratedState.resetGame();
            }
          }
        };
      },
    }
  )
);
