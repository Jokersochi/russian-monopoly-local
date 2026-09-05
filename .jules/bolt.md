## 2026-08-20 - Single-Pass Backward Loop Memoization for GameLog

**Learning:** In React components rendering growing lists with filter buttons and aggregate counters (like `GameLog`), invoking `.slice().reverse()` and multiple `.filter()` calls per render frame causes $O(K \times N)$ array iterations and redundant array allocations on every render. Refactoring to a single $O(N)$ backward `for` loop inside `useMemo` produces both the reversed filtered list and type counts simultaneously with zero extra array allocations.

**Action:** When component state requires reversed display order along with category/type counts, consolidate filtering, reversing, and counting into a single backward `for` loop inside `useMemo`.
