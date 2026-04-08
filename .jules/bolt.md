## 2025-05-15 - GameBoard Render Optimization
**Learning:** The `GameBoard` component performs $O(N \times M)$ lookups ($N=40$ cells, $M$ players) for both property ownership and player positions inside its main render loop. This leads to redundant work on every render, especially as the number of properties and players grows.
**Action:** Use `useMemo` to pre-calculate these lookups into `Map` objects once per `gameState` change. This reduces the per-cell lookup to $O(1)$.
