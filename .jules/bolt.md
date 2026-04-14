## 2026-04-14 - Map-based lookups in GameBoard
**Learning:** Rendering a game board with 40 cells and up to 6 players resulted in ~240 array operations per render due to O(N*M) lookups for property ownership and player positions.
**Action:** Use `useMemo` to pre-calculate `Map` lookups for entity states (ownership, positions) outside the render loop, reducing complexity to O(N+M) and minimizing operations to ~46 per render.
