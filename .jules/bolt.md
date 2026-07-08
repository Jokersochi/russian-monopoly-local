# Bolt's Performance Journal

## 2026-04-19 - Consolidating GameLog Traversals
**Learning:** The GameLog component was performing multiple $O(N)$ traversals (reverse, filter, and separate counts for each category) on every render. As the game progresses and the log grows, this becomes an avoidable performance bottleneck.
**Action:** Use `useMemo` with a single-pass backward loop to simultaneously filter and count log entries, reducing complexity from multiple $O(N)$ passes to exactly one.
