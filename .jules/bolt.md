## 2026-08-20 - Single-Pass Reversal and Count Aggregation in GameLog

**Learning:** Unmemoized array operations like `.slice().reverse()` combined with multiple `.filter()` executions across render items scale poorly ($O(N)$ with multiple passes) as list size grows. Traversing the source array backwards in a single `for` loop inside `useMemo` builds the reversed list and aggregates category counts in $O(N)$ time with zero extra array clones.
**Action:** When displaying inverted event streams or logs with type counters, consolidate array reversal, filtering, and aggregation into a single backward `for` loop inside `useMemo`.
