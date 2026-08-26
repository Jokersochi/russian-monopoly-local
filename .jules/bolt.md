## 2026-08-20 - Single-Pass Game Log Optimization
**Learning:** In components rendering growing lists with aggregate counts and filtering options (like `GameLog`), doing separate `.slice().reverse()` clones, category filters, and repeated `.filter().length` calls for badges scales poorly as logs grow ($O(K \times N)$).
**Action:** Use a single backward `for` loop inside `useMemo` to compute reversed/filtered list elements and aggregate category counts in a single $O(N)$ pass.
