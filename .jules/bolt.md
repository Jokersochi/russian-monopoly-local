## 2025-05-15 - [O(1) Map Lookups for Game Board]
**Learning:** Performing O(Players * Properties) searches inside a cell-rendering loop (40 cells) creates a significant performance bottleneck as the game progresses. Pre-calculating ownership and player positions into Map structures via `useMemo` reduces per-cell lookup from O(P) to O(1), improving overall board render complexity from O(C * P) to O(C + P).
**Action:** Always prefer pre-calculated Map or Object lookups in render loops for components displaying many items that depend on cross-referenced state.
