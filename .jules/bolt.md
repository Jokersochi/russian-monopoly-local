## 2024-10-14 - GameBoard Lookup Memoization
**Learning:** In React board games, per-cell lookups like player positions or cell owners executed inside cell iteration loops scale as O(C * P) per render pass. Pre-computing lookup maps with `useMemo` reduces this to O(1) lookups during render.
**Action:** Always extract inner loop searches over state collections into module-level or top-level `useMemo` maps before mapping over fixed layout grids.
