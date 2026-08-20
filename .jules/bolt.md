## 2026-04-19 - GameBoard O(Cells * Players) Render Overhead

**Learning:** In React components rendering 40 Monopoly cells (like `GameBoard`), performing `players.find` and `players.filter` inside `cells.map` causes $O(C \times P)$ computation overhead per render frame. Furthermore, computing net worth standings by filtering all 40 cells twice per player adds unnecessary array iterations.
**Action:** Precompute cell owner maps, player-per-cell maps, and player standings inside a top-level `useMemo` using direct array indexing (`cells[propId]`), reducing lookup times to $O(1)$.
