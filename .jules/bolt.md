## 2025-02-21 - Memoizing Player Stats in PlayerPanel
**Learning:** Computing player property and net worth stats across all cells on every render in PlayerPanel causes unnecessary O(P * C) iterations.
**Action:** Pre-compute player statistics inside useMemo to ensure O(1) lookups and single-pass calculations during component renders.
