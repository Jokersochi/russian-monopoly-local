## 2025-05-15 - [Game State Lookup Optimization]
**Learning:** In game logic components like `GameBoard`, $O(N \times M)$ lookups (cells * players) inside render loops cause significant performance degradation as the game progresses and players acquire more properties.
**Action:** Always pre-calculate data structures (e.g., `Map` or objects) for property ownership and player positions using `useMemo` at the top level of the component to ensure $O(1)$ lookups during the iterative rendering of the board.
