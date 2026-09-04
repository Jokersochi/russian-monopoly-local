## 2026-08-20 - Single-Pass Game Log Memoization

**Learning:** Computing list counts and reversed/filtered log entries through separate `.filter()` calls inside component render loops creates $O(KN)$ traversals and excessive array allocations per frame as log history grows.
**Action:** Consolidate array reversal, filter predicate matching, and type count aggregations into a single backward `for` loop inside a `useMemo` hook to maintain $O(N)$ runtime complexity and zero extra array allocations.
