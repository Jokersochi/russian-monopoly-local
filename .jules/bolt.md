## 2026-08-20 - Single-Pass Game Log Reversal and Counting
**Learning:** In React components that display growing logs, performing `slice().reverse()`, `filter()`, and repeated type counting functions on every render causes O(11 * N) array iterations. A single backward loop starting from `log.length - 1` inside `useMemo` handles reversal, filtering, and aggregate counts in a single O(N) pass.
**Action:** Consolidate list transformations (reversal, filtering, category counts) into a single backward `for` loop inside `useMemo` rather than chaining multiple array methods.
