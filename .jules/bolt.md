## 2026-04-14 - GameBoard O(N*M) Render Loop
**Learning:** The GameBoard was performing multiple array searches (find/filter) for every cell on every render, leading to O(Cells * Players) complexity. In a board with 40 cells and up to 8 players, this causes redundant computations that grow as players acquire more properties.
**Action:** Use `useMemo` to pre-calculate Map-based lookups for ownership and player positions, reducing lookup complexity to O(1) inside the cell render loop.
