## 2025-05-18 - Single-Pass Aggregation for Filtered Lists
**Learning:** In `GameLog.tsx`, calling `.filter()` repeatedly (8 times per render pass) for log category badge counts caused unnecessary $O(8N)$ iterations over growing log history arrays.
**Action:** Combine multi-category count computations into a single $O(N)$ `useMemo` loop pass with constant default fallbacks outside the component to prevent hook dependency instability.
