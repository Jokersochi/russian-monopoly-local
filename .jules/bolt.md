## 2026-10-02 - Memoize GameLog Filtering
**Learning:** Processing log entries and counts in a single backward pass inside useMemo eliminates O(N*M) array copying and filtering during re-renders.
**Action:** Always combine reverse iteration and count aggregation in useMemo when handling growing event logs.
