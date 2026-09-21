## 2026-08-20 - Single-Pass Game Log Computations
**Learning:** Re-calculating log counts and reversing the array on every render leads to multiple unnecessary array iterations.
**Action:** Use useMemo to perform a single O(N) pass for log filtering and type counting.
