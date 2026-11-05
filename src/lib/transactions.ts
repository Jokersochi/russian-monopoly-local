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
 * Validates untrusted deserialized GameState from localStorage to prevent
 * prototype pollution, state corruption, and client-side denial of service.
 */
export function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return false;
  const s = state as Record<string, unknown>;
  if (!Array.isArray(s.players) || s.players.length < 2 || s.players.length > 6) return false;
  const validPlayers = s.players.every((p: unknown) => {
    if (!p || typeof p !== 'object' || Array.isArray(p)) return false;
    const player = p as Record<string, unknown>;
    return Number.isInteger(player.id) &&
      typeof player.nameKey === 'string' &&
      isMoney(player.money as number) &&
      Number.isInteger(player.position) &&
      (player.position as number) >= 0 &&
      (player.position as number) < 40 &&
      Array.isArray(player.properties) &&
      Array.isArray(player.mortgaged) &&
      typeof player.inJail === 'boolean' &&
      typeof player.bankrupt === 'boolean';
  });
  if (!validPlayers) return false;
  return Number.isInteger(s.currentPlayer) &&
    (s.currentPlayer as number) >= 0 &&
    (s.currentPlayer as number) < s.players.length &&
    typeof s.phase === 'string' &&
    Number.isInteger(s.round) && (s.round as number) >= 1 &&
    Number.isInteger(s.maxRounds) && (s.maxRounds as number) >= 1 &&
    Array.isArray(s.gameLog) &&
    Boolean(s.houses) && typeof s.houses === 'object' && !Array.isArray(s.houses);
}
