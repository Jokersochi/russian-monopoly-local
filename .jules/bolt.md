# Bolt's Journal - Critical Learnings

## 2026-08-20 - Memoizing board lookups and standings in GameBoard
**Learning:** Performing repeated `players.find` and `players.filter` inside cell loops in `GameBoard.tsx` causes $O(C \times P)$ overhead on every render frame. Pre-computing `ownerByCellId`, `playersByCellId`, and `netWorthStandings` inside `useMemo` converts these into $O(1)$ lookups and eliminates redundant iterations over all 40 cells.
**Action:** Always pre-compute map lookups for board cell ownership and player positions when rendering grid components that update frequently.
