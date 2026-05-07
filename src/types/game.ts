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

export interface PlayerStats {
  rentCollected: number;
  rentPaid: number;
  propertiesBought: number;
}

export interface Player {
  id: number;
  nameKey: string;
  displayName?: string;
  token: string;
  money: number;
  position: number;
  properties: number[];
  mortgaged: number[];
  getOutOfJailCards: number;
  inJail: boolean;
  jailTurns: number;
  hasResidence: boolean;
  residenceCity?: number;
  contracts: string[];
  bankrupt: boolean;
  stats: PlayerStats;
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
  currentCard?: ChanceCard;
  lastRoll: [number, number] | null;
  lastRentPaid?: number;
  doubleCount: number;
  gameLog: LogEntry[];
  round: number;
  maxRounds: number;
  houses: Record<number, number>;
  currentEvent?: MicroEvent;
  bankruptcyDebt?: number;
  bankruptcyCreditor?: number | null;
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
  | 'pre-bankruptcy'
  | 'game-over';

export interface AuctionState {
  cellId: number;
  currentBid: number;
  highBidder: number | null;
  currentBidder: number;
  participants: number[];
  passedPlayers: number[];
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

export interface TradeOffer {
  fromPlayer: number;
  toPlayer: number;
  offeredProperties: number[];
  requestedProperties: number[];
  offeredMoney: number;
  requestedMoney: number;
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
  contracts: {
    [key: string]: string;
  };
}
