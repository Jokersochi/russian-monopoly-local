## 2026-08-20 - Single-Pass Backward Memoization for Log Rendering

**Learning:** Unmemoized array operations like `.slice().reverse()` combined with repeated `.filter()` calls inside render loops create $O(11N)$ complexity per render frame as lists grow.
**Action:** Consolidate reverse filtering and count aggregations into a single backward `for` loop inside `useMemo` to achieve zero-allocation $O(N)$ memoized calculations.
