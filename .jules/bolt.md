## 2025-10-05 - Single-pass log processing in GameLog
**Learning:** Processing game log arrays using multiple array iterations (`slice().reverse()`, `filter()`, and multiple `countByType()` scans) leads to repeated $O(N)$ allocations and traversals per render. Consolidating into a single backward pass inside `useMemo` eliminates redundant array allocations and reduces log filtering complexity to $O(N)$.
**Action:** Always combine array reversal, filtering, and aggregate counting into a single backward pass when rendering ordered logs or history lists.
