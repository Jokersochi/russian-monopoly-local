import type { GameState, TradeOffer } from '../types/game';

export const isMoney = (value: number): boolean => Number.isSafeInteger(value) && value >= 0;

export function canPlaceBid(state: GameState, amount: number): boolean {
  const auction = state.auctionState;
  if (state.phase !== 'auction' || !auction || !isMoney(amount)) return false;
  const bidder = state.players[auction.currentBidder];
  return !!bidder && !bidder.bankrupt && isMoney(bidder.money) &&
    auction.participants.includes(auction.currentBidder) &&
    !auction.passedPlayers.includes(auction.currentBidder) &&
    amount > auction.currentBid && amount <= bidder.money;
}

export function canExecuteTrade(state: GameState, offer: TradeOffer): boolean {
  if (!offer || !Number.isInteger(offer.fromPlayer) || !Number.isInteger(offer.toPlayer) ||
      offer.fromPlayer !== state.currentPlayer || offer.fromPlayer === offer.toPlayer ||
      ['auction', 'moving', 'pre-bankruptcy', 'game-over', 'setup'].includes(state.phase)) return false;
  const from = state.players[offer.fromPlayer];
  const to = state.players[offer.toPlayer];
  if (!from || !to || from.bankrupt || to.bankrupt ||
      !isMoney(from.money) || !isMoney(to.money) ||
      !isMoney(offer.offeredMoney) || !isMoney(offer.requestedMoney) ||
      from.money < offer.offeredMoney || to.money < offer.requestedMoney ||
      !isMoney(from.money - offer.offeredMoney + offer.requestedMoney) ||
      !isMoney(to.money - offer.requestedMoney + offer.offeredMoney)) return false;
  const validProperties = (ids: number[], owner: typeof from) => Array.isArray(ids) &&
    new Set(ids).size === ids.length && ids.every(id => Number.isInteger(id) &&
      owner.properties.includes(id) && !owner.mortgaged.includes(id) && !(state.houses[id] > 0));
  return validProperties(offer.offeredProperties, from) && validProperties(offer.requestedProperties, to) &&
    !offer.offeredProperties.some(id => offer.requestedProperties.includes(id));
}

/**
 * Validates deserialized GameState loaded from untrusted storage (e.g. localStorage)
 * to prevent prototype poisoning, injection, or unexpected runtime exceptions.
 */
export function isValidGameState(state: unknown): state is GameState {
  if (typeof state !== 'object' || state === null) return false;
  const s = state as Partial<GameState>;

  if (!Array.isArray(s.players) || s.players.length === 0 || s.players.length > 6) return false;
  if (!Number.isInteger(s.currentPlayer) || s.currentPlayer! < 0 || s.currentPlayer! >= s.players.length) return false;
  if (typeof s.phase !== 'string' || !s.phase) return false;
  if (!Number.isInteger(s.round) || s.round! < 0) return false;
  if (!Number.isInteger(s.maxRounds) || s.maxRounds! <= 0) return false;
  if (!Array.isArray(s.gameLog)) return false;

  return s.players.every(p =>
    typeof p === 'object' && p !== null &&
    Number.isInteger(p.id) &&
    typeof p.nameKey === 'string' &&
    typeof p.money === 'number' && Number.isFinite(p.money) &&
    Number.isInteger(p.position) && p.position >= 0 && p.position < 40 &&
    Array.isArray(p.properties) && p.properties.every(id => Number.isInteger(id) && id >= 0 && id < 40) &&
    Array.isArray(p.mortgaged) &&
    typeof p.bankrupt === 'boolean'
  );
}
