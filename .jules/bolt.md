## 2026-08-20 - Consolidating GameLog array reversals and counts into single-pass useMemo
**Learning:** Reversing arrays with `.slice().reverse()` and running multiple `.filter()` queries per render frame creates excessive array allocations and O(N*K) iterations.
**Action:** Use a single-pass backward `for` loop starting from `array.length - 1` inside a `useMemo` hook to simultaneously reverse the list and count entry types in O(N) time without extra allocations.
