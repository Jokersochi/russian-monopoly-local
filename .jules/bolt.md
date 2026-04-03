# Bolt Performance Journal

## 2025-05-15 - Optimize GameBoard lookup complexity
**Learning:** In game logic components like `GameBoard`, avoid O(N*M) lookups inside render loops by pre-calculating data structures (e.g., `Map` or objects) for property ownership and player positions using `useMemo`.
**Action:** Use `useMemo` to create lookup maps for complex state queries that would otherwise be repeated for every item in a list (like cells on a board).
