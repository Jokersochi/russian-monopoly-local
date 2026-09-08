## 2026-08-20 - Single-Pass Memoized Processing for GameLog

**Learning:** Reversing arrays with `slice().reverse()` and filtering multiple times across render passes introduces unnecessary array allocations and $O(10N)$ complexity for growing lists like game logs. Consolidating filtering and aggregation into a single reverse loop within `useMemo` reduces computation to $O(N)$ without intermediate array copies.
**Action:** When displaying lists requiring reverse ordering and type counts, use a single backward `for` loop starting from `length - 1` inside `useMemo` to compute filtered results and aggregate statistics in one pass.
