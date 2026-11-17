## 2026-10-08 - Precompute board cell lookups and leaderboard rankings in GameBoard
**Learning:** In React board game UIs, calling array search methods like `.find()` and `.filter()` inside iteration loops over board cells (40 cells x P players) on every render tick creates redundant O(C * P) overhead. Pre-computing lookup maps with `useMemo` converts repeated scans into O(1) map lookups.
**Action:** Always pre-compute Map index structures for board cell ownership and player positions using `useMemo` positioned before conditional returns.
