import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/data/board.ts', 'src/lib/boardGeometry.ts', 'src/lib/onlineEngine.ts', 'src/lib/transactions.ts'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 60,
        statements: 60,
      },
    },
  },
});
