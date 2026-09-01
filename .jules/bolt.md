## 2026-08-20 - Memoizing Board Render Computations with Map Lookups

**Learning:** `GameBoard.tsx` was running linear $O(P \times C)$ array searches (`players.find`, `players.filter`, `cells.filter`) inside the 40-cell map loop and standings calculation on every single render. Grouping player properties and board positions into pre-computed `Map<number, ...>` structures within a top-level `useMemo` reduces per-cell lookups to $O(1)$ and avoids redundant array allocations during turn transitions and board animations.

**Action:** Always precompute entity relationship maps (`Map<id, entity>`) inside `useMemo` before rendering large grid or board components instead of invoking `.find()` or `.filter()` inside map callbacks.
