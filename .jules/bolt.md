## 2026-04-14 - O(N*M) Render Loop Optimization
**Learning:** In the Russian Monopoly GameBoard, rendering 40 cells with nested array searches for player positions and property ownership created an O(Cells * Players) bottleneck.
**Action:** Use `useMemo` to pre-calculate Map-based lookups (O(1)) for entity positions and ownership before entering the render loop.
