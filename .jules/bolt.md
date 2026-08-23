## 2026-08-20 - GameBoard Render Lookup Optimization with Map and useMemo
**Learning:** In `GameBoard.tsx`, calling `players.find()` and `players.filter()` on every cell render (40 cells) plus `cells.filter()` per player in standings creates linear searches ($O(P \times C)$) on every render frame.
**Action:** Precalculate ownership maps (`Map<number, Player>`), cell occupancy maps (`Map<number, Player[]>`), and net worth standings in a top-level `useMemo` hook to achieve $O(1)$ lookups during cell rendering.
