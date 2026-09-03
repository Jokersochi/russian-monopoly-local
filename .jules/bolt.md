# Bolt's Journal - Performance Optimization

## 2026-08-20 - Single-Pass Backward Loop Aggregation for Display Logs

**Learning:** Component render performance for log components degrades when performing multiple operations (such as `.slice().reverse()`, `.filter()`, and repeated `.filter()` queries for count badges) on an array. Consolidating array reversal, filtering, and aggregate counting into a single backward `for` loop inside `useMemo` reduces computation from $O(K \times N)$ to a single $O(N)$ pass with zero intermediate array allocations.

**Action:** Whenever display components require reversing a list along with filtering or calculating counts by category, use a single backward loop `for (let i = array.length - 1; i >= 0; i--)` within `useMemo` to build the reversed filtered list and compute counts simultaneously.
