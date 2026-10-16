## 2026-08-20 - Memoizing GameLog processing in React
**Learning:** Re-indexing and filtering log arrays using `slice().reverse()` and multiple `.filter()` calls inside component renders causes redundant array allocations and unnecessary O(N*K) iterations on every state update.
**Action:** Consolidate array reversing, category aggregation, and filter matching into a single backward O(N) pass inside `useMemo` called unconditionally above any early component returns.
