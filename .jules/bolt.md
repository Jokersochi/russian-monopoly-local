## 2025-02-18 - Memoize cell ownership and player lookups in GameBoard
**Learning:** In board game components with high cell counts (e.g. 40 cells), invoking array array searches like `players.find` and `players.filter` inside `cells.map` causes O(C * P) overhead per render frame. Pre-computing cell ID maps and net worth rankings in `useMemo` transforms cell lookups into O(1) property access.
**Action:** Always pre-compute cell ownership and player positions into Record<number, Player> maps with `useMemo` before mapping board cells.
