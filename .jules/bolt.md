## 2026-04-19 - Consolidated Game Log Processing
**Learning:** Multiple O(N) passes (clone, reverse, filter, counts) on growing arrays like the game log can be significantly reduced by using a single-pass backward loop within `useMemo`.
**Action:** Always look for opportunities to merge multiple array operations into a single traversal using `reduce` or a `for` loop when performance is a concern.
