import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/data/board.ts', 'server/engine.ts', 'server/rooms.ts', 'server/http.ts', 'server/storage.ts'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        lines: 60,
        statements: 60,
      },
    },
  },
});
