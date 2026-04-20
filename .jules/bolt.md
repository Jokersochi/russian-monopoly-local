## 2026-04-19 - O(N*M) to O(N+M) GameBoard Optimization
**Learning:** React render loops for large grids (like a 40-cell Monopoly board) can become a bottleneck if they contain nested lookups over other state arrays (like players).
**Action:** Use `useMemo` to pre-calculate Map-based lookups outside the loop to achieve O(1) access time within the render map, reducing overall complexity from O(N*M) to O(N+M).
