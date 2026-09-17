## 2026-08-20 - Single-Pass Reversal and Aggregation in GameLog
**Learning:** Calling `slice().reverse()` followed by repeated `filter()` queries on every re-render causes multiple unnecessary array allocations and O(N) traversals per filter button.
**Action:** Use a single backward `for` loop inside `useMemo` to construct the reversed array and accumulate type counts simultaneously in a single O(N) pass.
