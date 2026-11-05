## 2025-05-18 - Map pre-computation for board rendering
**Learning:** In React components rendering repeating grid structures (like 40 Monopoly board cells), inner-loop array scans like `players.find` and `players.filter` cause $O(C \times P)$ overhead per render.
**Action:** Pre-compute indexed `Map` lookups and leaderboard statistics unconditionally at top-level using `useMemo`.
