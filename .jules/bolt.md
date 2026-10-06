## 2025-05-18 - Memoized GameBoard cell lookups and net worth standings
**Learning:** Unmemoized array traversals inside cell mapping loops (40 cells) caused O(C * P) overhead per render frame.
**Action:** Pre-compute lookup Maps and sorted standings in useMemo hooks placed before conditional returns.
