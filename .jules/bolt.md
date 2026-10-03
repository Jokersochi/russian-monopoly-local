## 2025-02-28 - Memoize GameBoard Lookups
**Learning:** Pre-computing cell ownership and standings inside a useMemo hook reduces O(C * P) array scans to O(1) Map lookups per render.
**Action:** Pre-compute Map lookups for board cell properties and standings in render loops.
