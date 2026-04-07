## 2025-05-22 - [Optimizing Render Loops with Maps]
**Learning:** In Monopoly-style board games, components like `GameBoard` and `PlayerPanel` often perform O(N*M) lookups (e.g., finding owners for each cell) on every render. Even with only 40 cells and a few players, this scales poorly and can cause dropped frames during animations.
**Action:** Always pre-calculate expensive lookups using `useMemo` and `Map` or `Set` data structures outside the main render loop to ensure O(1) access inside the loop.
