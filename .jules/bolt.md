## 2026-04-14 - Map-based O(1) lookups in GameBoard
**Learning:** Iterating through all cells and performing array searches for players and ownership on each cell creates an O(Cells * Players) bottleneck. Using `useMemo` to pre-calculate `Map` lookups reduces this to O(Cells + Players), significantly improving render performance.
**Action:** Always prefer Map-based lookups for spatial or entity relationships in render loops where N cells meet M entities.
