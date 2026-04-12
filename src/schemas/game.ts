import { z } from 'zod';

export const CellTypeSchema = z.enum([
  'city',
  'transport',
  'utility',
  'chance',
  'trial',
  'tax',
  'start',
  'jail',
  'visiting',
  'free-parking',
  'go-to-jail',
]);

export const CategorySchema = z.enum([
  'tourism',
  'transport',
  'industry',
  'culture',
  'education',
  'nature',
]);

export const GamePhaseSchema = z.enum([
  'setup',
  'rolling',
  'moving',
  'landed',
  'buying',
  'auction',
  'paying-rent',
  'card-draw',
  'jail',
  'game-over',
]);

export const PlayerSchema = z.object({
  id: z.number(),
  nameKey: z.string(),
  token: z.string(),
  money: z.number(),
  position: z.number(),
  properties: z.array(z.number()),
  getOutOfJailCards: z.number(),
  inJail: z.boolean(),
  jailTurns: z.number(),
  hasResidence: z.boolean(),
  residenceCity: z.number().optional(),
  contracts: z.array(z.string()),
  bankrupt: z.boolean(),
});

export const LogEntrySchema = z.object({
  id: z.number(),
  textKey: z.string(),
  params: z.record(z.union([z.string(), z.number()])).optional(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  timestamp: z.number(),
});

export const MicroEventSchema = z.object({
  id: z.string(),
  nameKey: z.string(),
  descriptionKey: z.string(),
  effects: z.object({
    category: CategorySchema.optional(),
    rentMultiplier: z.number().optional(),
    taxMultiplier: z.number().optional(),
    bonus: z.number().optional(),
  }),
});

export const AuctionStateSchema = z.object({
  cellId: z.number(),
  currentBid: z.number(),
  currentBidder: z.number().nullable(),
  participants: z.array(z.number()),
  passedPlayers: z.array(z.number()), // Zod doesn't handle Set well for JSON serialization
});

export const GameStateSchema = z.object({
  players: z.array(PlayerSchema),
  currentPlayer: z.number(),
  dice: z.tuple([z.number(), z.number()]),
  phase: GamePhaseSchema,
  auctionState: AuctionStateSchema.optional(),
  lastRoll: z.tuple([z.number(), z.number()]).nullable(),
  doubleCount: z.number(),
  gameLog: z.array(LogEntrySchema),
  round: z.number(),
  maxRounds: z.number(),
  currentEvent: MicroEventSchema.optional(),
});

export type GameStateInput = z.infer<typeof GameStateSchema>;
