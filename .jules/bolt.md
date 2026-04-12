## 2025-05-14 - Optimized board and player lookups

**Learning:** The game board and player panel were performing O(N*M) and O(N) lookups respectively inside their render loops. For a 40-cell board with multiple players, this led to redundant array searches (find, filter, includes) on every render.

**Action:** Use `useMemo` to pre-calculate Map-based lookups (e.g., cell ID to owner) at the start of the component. This reduces the complexity inside the render loop to O(1) for each element. Also, prefer direct length checks on ID arrays (e.g., `player.properties.length`) instead of filtering the master cell list when only the count is needed.
