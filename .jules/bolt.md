## 2026-09-25 - Memoizing GameBoard cell lookups and standings
**Learning:** Pre-computing cell ownership maps and net worth standings inside useMemo converts O(C * P) array traversals into O(1) lookups during GameBoard renders.
**Action:** Use Map-based useMemo indexes for grid/board cells with dynamic player state.
