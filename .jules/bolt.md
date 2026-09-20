## 2026-08-20 - Single-Pass Game Log Processing

**Learning:** Processing log entries and log type counts in a single backward pass inside `useMemo` in `GameLog.tsx` eliminates redundant shallow array copies, array reversals (`slice().reverse()`), and multiple filter traversals ($O(4N)$).
**Action:** When calculating derived state and category counts from an array, combine reversal, filtering, and count aggregations into a single $O(N)$ loop inside `useMemo`.
