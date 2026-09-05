## 2026-08-20 - Single-pass aggregation for list components with filtering and type counts

**Learning:** Components that render lists with newest-first ordering and category counts (like `GameLog`) often suffer from multiple hidden $O(N)$ passes when `.slice().reverse()`, `.filter()`, and repeated `countByType` calls are performed on every render. Iterating backwards once (`for (let i = log.length - 1; i >= 0; i--)`) inside `useMemo` produces both the reversed filtered list and exact category counts simultaneously without intermediate array allocations.

**Action:** Look for UI components displaying ordered logs or collections with category counts and combine sorting, filtering, and counting into a single backward pass inside `useMemo`.
