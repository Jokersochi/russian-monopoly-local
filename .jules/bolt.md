## 2025-05-18 - Pre-compute Board Map Lookups and Leaderboard in GameBoard
**Learning:** Performing array searches (`find`, `filter`) for cell owners, player positions, and property values across 40 board cells on every render causes $O(C \times P \times \text{props})$ re-render overhead. Using `Map` indexed lookups inside `useMemo` hooks placed before early guards eliminates redundant board scans.
**Action:** Pre-compute lookup maps (`Map<cellId, Player>`, `Map<position, Player[]>`) and derived leaderboard rankings with `useMemo` for board components.
