import { Cell } from '@/types/game';

export const BOARD_CELLS: Cell[] = [
  // Bottom row (right to left)
  { id: 0, type: 'start', nameKey: 'start', position: { x: 10, y: 10 } },
  { id: 1, type: 'city', nameKey: 'moscow', category: 'culture', price: 600000, rent: [20000, 100000, 300000, 900000, 1600000, 2500000], houseCost: 500000, color: '#8B4513', position: { x: 9, y: 10 } },
  { id: 2, type: 'trial', nameKey: 'trial', position: { x: 8, y: 10 } },
  { id: 3, type: 'city', nameKey: 'stPetersburg', category: 'culture', price: 600000, rent: [20000, 100000, 300000, 900000, 1600000, 2500000], houseCost: 500000, color: '#8B4513', position: { x: 7, y: 10 } },
  { id: 4, type: 'tax', nameKey: 'incomeTax', position: { x: 6, y: 10 } },
  { id: 5, type: 'transport', nameKey: 'airport', category: 'transport', price: 2000000, rent: [250000, 500000, 1000000, 2000000], position: { x: 5, y: 10 } },
  { id: 6, type: 'city', nameKey: 'novosibirsk', category: 'industry', price: 1000000, rent: [60000, 300000, 900000, 2700000, 4000000, 5500000], houseCost: 500000, color: '#87CEEB', position: { x: 4, y: 10 } },
  { id: 7, type: 'chance', nameKey: 'chance', position: { x: 3, y: 10 } },
  { id: 8, type: 'city', nameKey: 'yekaterinburg', category: 'industry', price: 1000000, rent: [60000, 300000, 900000, 2700000, 4000000, 5500000], houseCost: 500000, color: '#87CEEB', position: { x: 2, y: 10 } },
  { id: 9, type: 'city', nameKey: 'kazan', category: 'tourism', price: 1200000, rent: [80000, 400000, 1100000, 3300000, 4750000, 6000000], houseCost: 500000, color: '#FF1493', position: { x: 1, y: 10 } },
  { id: 10, type: 'jail', nameKey: 'jail', position: { x: 0, y: 10 } },

  // Left column (bottom to top)
  { id: 11, type: 'city', nameKey: 'nizhnyNovgorod', category: 'industry', price: 1400000, rent: [100000, 500000, 1500000, 4500000, 6250000, 7500000], houseCost: 1000000, color: '#FF8C00', position: { x: 0, y: 9 } },
  { id: 12, type: 'utility', nameKey: 'electricity', category: 'industry', price: 1500000, position: { x: 0, y: 8 } },
  { id: 13, type: 'city', nameKey: 'samara', category: 'industry', price: 1400000, rent: [100000, 500000, 1500000, 4500000, 6250000, 7500000], houseCost: 1000000, color: '#FF8C00', position: { x: 0, y: 7 } },
  { id: 14, type: 'city', nameKey: 'rostov', category: 'tourism', price: 1600000, rent: [120000, 600000, 1800000, 5000000, 7000000, 9000000], houseCost: 1000000, color: '#FF4500', position: { x: 0, y: 6 } },
  { id: 15, type: 'transport', nameKey: 'railway', category: 'transport', price: 2000000, rent: [250000, 500000, 1000000, 2000000], position: { x: 0, y: 5 } },
  { id: 16, type: 'city', nameKey: 'ufa', category: 'nature', price: 1800000, rent: [140000, 700000, 2000000, 5500000, 7500000, 9500000], houseCost: 1000000, color: '#FF0000', position: { x: 0, y: 4 } },
  { id: 17, type: 'trial', nameKey: 'trial', position: { x: 0, y: 3 } },
  { id: 18, type: 'city', nameKey: 'chelyabinsk', category: 'industry', price: 1800000, rent: [140000, 700000, 2000000, 5500000, 7500000, 9500000], houseCost: 1000000, color: '#FF0000', position: { x: 0, y: 2 } },
  { id: 19, type: 'city', nameKey: 'omsk', category: 'industry', price: 2000000, rent: [160000, 800000, 2200000, 6000000, 8000000, 10000000], houseCost: 1000000, color: '#FFFF00', position: { x: 0, y: 1 } },
  { id: 20, type: 'free-parking', nameKey: 'freeParking', position: { x: 0, y: 0 } },

  // Top row (left to right)
  { id: 21, type: 'city', nameKey: 'perm', category: 'industry', price: 2200000, rent: [180000, 900000, 2500000, 7000000, 8750000, 10500000], houseCost: 1500000, color: '#00FF00', position: { x: 1, y: 0 } },
  { id: 22, type: 'chance', nameKey: 'chance', position: { x: 2, y: 0 } },
  { id: 23, type: 'city', nameKey: 'voronezh', category: 'industry', price: 2200000, rent: [180000, 900000, 2500000, 7000000, 8750000, 10500000], houseCost: 1500000, color: '#00FF00', position: { x: 3, y: 0 } },
  { id: 24, type: 'city', nameKey: 'volgograd', category: 'culture', price: 2400000, rent: [200000, 1000000, 3000000, 7500000, 9250000, 11000000], houseCost: 1500000, color: '#0000FF', position: { x: 4, y: 0 } },
  { id: 25, type: 'transport', nameKey: 'seaport', category: 'transport', price: 2000000, rent: [250000, 500000, 1000000, 2000000], position: { x: 5, y: 0 } },
  { id: 26, type: 'city', nameKey: 'krasnoyarsk', category: 'nature', price: 2600000, rent: [220000, 1100000, 3300000, 8000000, 9750000, 11500000], houseCost: 1500000, color: '#4B0082', position: { x: 6, y: 0 } },
  { id: 27, type: 'city', nameKey: 'sochi', category: 'tourism', price: 2600000, rent: [220000, 1100000, 3300000, 8000000, 9750000, 11500000], houseCost: 1500000, color: '#4B0082', position: { x: 7, y: 0 } },
  { id: 28, type: 'utility', nameKey: 'waterworks', category: 'industry', price: 1500000, position: { x: 8, y: 0 } },
  { id: 29, type: 'city', nameKey: 'kremlin', category: 'culture', price: 3500000, rent: [350000, 1750000, 5000000, 11000000, 13000000, 15000000], houseCost: 2000000, color: '#8B0000', position: { x: 9, y: 0 } },
  { id: 30, type: 'go-to-jail', nameKey: 'goToJail', position: { x: 10, y: 0 } },

  // Right column (top to bottom)
  { id: 31, type: 'city', nameKey: 'hermitage', category: 'culture', price: 3000000, rent: [260000, 1300000, 3900000, 9000000, 11000000, 12750000], houseCost: 2000000, color: '#FFD700', position: { x: 10, y: 1 } },
  { id: 32, type: 'city', nameKey: 'redSquare', category: 'culture', price: 3000000, rent: [260000, 1300000, 3900000, 9000000, 11000000, 12750000], houseCost: 2000000, color: '#FFD700', position: { x: 10, y: 2 } },
  { id: 33, type: 'trial', nameKey: 'trial', position: { x: 10, y: 3 } },
  { id: 34, type: 'city', nameKey: 'transib', category: 'transport', price: 3200000, rent: [280000, 1500000, 4500000, 10000000, 12000000, 14000000], houseCost: 2000000, color: '#00CED1', position: { x: 10, y: 4 } },
  { id: 35, type: 'transport', nameKey: 'busStation', category: 'transport', price: 2000000, rent: [250000, 500000, 1000000, 2000000], position: { x: 10, y: 5 } },
  { id: 36, type: 'chance', nameKey: 'chance', position: { x: 10, y: 6 } },
  { id: 37, type: 'city', nameKey: 'baikal', category: 'nature', price: 3500000, rent: [350000, 1750000, 5000000, 11000000, 13000000, 15000000], houseCost: 2000000, color: '#4169E1', position: { x: 10, y: 7 } },
  { id: 38, type: 'tax', nameKey: 'luxuryTax', position: { x: 10, y: 8 } },
  { id: 39, type: 'city', nameKey: 'goldenRing', category: 'tourism', price: 4000000, rent: [500000, 2000000, 6000000, 14000000, 17000000, 20000000], houseCost: 2000000, color: '#800080', position: { x: 10, y: 9 } },
];

export const CHANCE_CARDS = [
  { id: 1, textKey: 'chance1', type: 'bonus' as const, effect: { money: 50000 } },
  { id: 2, textKey: 'chance2', type: 'bonus' as const, effect: { money: 30000 } },
  { id: 3, textKey: 'chance3', type: 'bonus' as const, effect: { money: 20000 } },
  { id: 4, textKey: 'chance4', type: 'special' as const, effect: { collectFromPlayers: 10000 } },
  { id: 5, textKey: 'chance5', type: 'special' as const, effect: { getOutOfJail: true } },
];

export const TRIAL_CARDS = [
  { id: 1, textKey: 'trial1', type: 'penalty' as const, effect: { taxPerProperty: 15000 } },
  { id: 2, textKey: 'trial2', type: 'penalty' as const, effect: { money: -25000 } },
  { id: 3, textKey: 'trial3', type: 'penalty' as const, effect: { money: -50000 } },
  { id: 4, textKey: 'trial4', type: 'penalty' as const, effect: { taxPerProperty: -0.1 } },
  { id: 5, textKey: 'trial5', type: 'move' as const, effect: { moveToCell: 0 } },
];

export const PLAYER_TOKENS = [
  { id: 'samovar', icon: '🫖', nameKey: 'samovar' },
  { id: 'balalaika', icon: '🎻', nameKey: 'balalaika' },
  { id: 'matryoshka', icon: '🪆', nameKey: 'matryoshka' },
  { id: 'bear', icon: '🐻', nameKey: 'bear' },
  { id: 'ushanka', icon: '🧢', nameKey: 'ushanka' },
  { id: 'rocket', icon: '🚀', nameKey: 'rocket' },
];
