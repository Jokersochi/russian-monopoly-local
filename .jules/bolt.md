## 2026-08-20 - Memoizing log entry processing in GameLog

**Learning:** Calling .filter() repeatedly inside JSX iteration causes redundant O(N) array traversals on every render.
**Action:** Aggregate counts and reverse log entries in a single O(N) backward pass inside useMemo.
