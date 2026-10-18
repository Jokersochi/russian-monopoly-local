## 2025-05-18 - Single-pass useMemo for GameLog filter counts
**Learning:** Computing filter counts per button via array filter scans during render scales as O(N * K) and re-evaluates on all state changes. Single-pass O(N) useMemo eliminates redundant passes and array allocations.
**Action:** Always pre-compute group/category counts in a single O(N) useMemo loop when rendering multiple filter options.
