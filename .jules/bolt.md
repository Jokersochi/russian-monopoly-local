## 2026-10-13 - Memoize Game Log Category Counts
**Learning:** Computing category counts across multiple array scans repeatedly during component re-renders degrades performance as game log grows (O(N * K)). Pre-computing counts in a single O(N) pass inside `useMemo` reduces array iterations and eliminates allocations during render loops.
**Action:** Pre-compute aggregate category counts in a single O(N) pass with `useMemo` when rendering category filter UI controls.
