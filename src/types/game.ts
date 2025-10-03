export type CellType = 
  | 'city' 
  | 'transport' 
  | 'utility' 
  | 'chance' 
  | 'trial' 
  | 'tax' 
  | 'start' 
  | 'jail' 
  | 'visiting' 
  | 'free-parking'
  | 'go-to-jail';

export type Category = 
  | 'tourism' 
  | 'transport' 
  | 'industry' 
  | 'culture' 
  | 'education' 
  | 'nature';

export interface Cell {
  id: number;
  type: CellType;
  nameKey: string;
  category?: Category;
  price?: number;
  rent?: number[];
  houseCost?: number;
  color?: string;
  position: { x: number; y: number };
}

export interface Player {
  id: number;
  nameKey: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  getOutOfJailCards: number;
  inJail: boolean;
  jailTurns: number;
  hasResidence: boolean;
  residenceCity?: number;
  contracts: string[];
  bankrupt: boolean;
}

export interface ChanceCard {
  id: number;
  textKey: string;
  type: 'bonus' | 'penalty' | 'move' | 'special';
  effect: CardEffect;
}

export interface CardEffect {
  money?: number;
  moveToCell?: number;
  moveSteps?: number;
  getOutOfJail?: boolean;
  taxPerProperty?: number;
  collectFromPlayers?: number;
  payToPlayers?: number;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  dice: [number, number];
  phase: GamePhase;
  auctionState?: AuctionState;
  lastRoll: [number, number] | null;
  doubleCount: number;
  gameLog: LogEntry[];
  round: number;
  maxRounds: number;
  currentEvent?: MicroEvent;
}

export type GamePhase = 
  | 'setup' 
  | 'rolling' 
  | 'moving' 
  | 'landed' 
  | 'buying' 
  | 'auction' 
  | 'paying-rent'
  | 'card-draw'
  | 'jail'
  | 'game-over';

export interface AuctionState {
  cellId: number;
  currentBid: number;
  currentBidder: number | null;
  participants: number[];
  passedPlayers: Set<number>;
}

export interface LogEntry {
  id: number;
  textKey: string;
  params?: Record<string, string | number>;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface MicroEvent {
  id: string;
  nameKey: string;
  descriptionKey: string;
  effects: {
    category?: Category;
    rentMultiplier?: number;
    taxMultiplier?: number;
    bonus?: number;
  };
}

export interface Contract {
  id: string;
  nameKey: string;
  category: Category;
  price: number;
  rentBonus: number;
}

export interface LocaleStrings {
  game: {
    title: string;
    newGame: string;
    continue: string;
    rollDice: string;
    buy: string;
    pass: string;
    endTurn: string;
    payRent: string;
    bid: string;
    [key: string]: string;
  };
  cells: {
    [key: string]: string;
  };
  cards: {
    [key: string]: string;
  };
  players: {
    [key: string]: string;
  };
  log: {
    [key: string]: string;
  };
}
