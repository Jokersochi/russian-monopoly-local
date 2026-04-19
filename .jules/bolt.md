## 2026-04-14 - Map-based Game State Lookups
**Learning:** In a game with a high number of cells (40) and multiple players, performing linear searches (O(N*M)) inside the cell render loop is a significant bottleneck. Hoisting these lookups into O(1) Maps within `useMemo` hooks significantly improves frame consistency.
**Action:** Use Map-based caches for entity lookups (owners, positions) in game board components.

## 2026-04-14 - useMemo Safety with Nullable State
**Learning:** When moving logic from a component body (after an early return) into a `useMemo` hook (which must be at the top level), ensure all state access uses optional chaining.
**Action:** Always use `gameState?.players?.forEach` instead of `gameState?.players.forEach` inside hooks to prevent crashes during initial state hydration.
