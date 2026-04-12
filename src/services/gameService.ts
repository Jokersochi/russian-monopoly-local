import { GameState, Player, Cell, LogEntry } from '@/types/game';
import { BOARD_CELLS } from '@/data/board';

/**
 * Pure game logic service.
 * These functions should not have side effects and should return new state objects.
 */
export const gameService = {
  /**
   * Calculates the new position and checks if the player passed the start cell.
   */
  calculateMovement: (currentPosition: number, rollSum: number): { newPosition: number; passedStart: boolean } => {
    const totalCells = BOARD_CELLS.length;
    const newPosition = (currentPosition + rollSum) % totalCells;
    const passedStart = newPosition < currentPosition;
    return { newPosition, passedStart };
  },

  /**
   * Gets the cell at a specific position.
   */
  getCell: (position: number): Cell => {
    return BOARD_CELLS[position];
  },

  /**
   * Checks if a cell is owned by any player.
   */
  getOwner: (players: Player[], cellId: number): Player | undefined => {
    return players.find(p => p.properties.includes(cellId));
  },

  /**
   * Creates a new log entry.
   */
  createLogEntry: (textKey: string, type: LogEntry['type'] = 'info', params?: Record<string, string | number>): LogEntry => {
    return {
      id: Date.now(),
      textKey,
      params,
      type,
      timestamp: Date.now(),
    };
  },

  /**
   * Calculates rent for a given cell.
   */
  calculateRent: (cell: Cell, owner: Player, players: Player[]): number => {
    if (!cell.rent || cell.rent.length === 0) return 0;

    // Logic for multipliers could be added here (e.g. monopolies, houses)
    // For now, basic rent:
    return cell.rent[0];
  },

  /**
   * Moves to the next player.
   */
  getNextPlayerIndex: (players: Player[], currentIndex: number): number => {
    let nextIndex = (currentIndex + 1) % players.length;
    // Skip bankrupt players
    while (players[nextIndex].bankrupt && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    return nextIndex;
  }
};
