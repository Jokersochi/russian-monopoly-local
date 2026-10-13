## 2026-10-08 - Single-Pass Memoization for Log Filter Counts
**Learning:** In React log components with filtering and type counters, calling array filter functions inside JSX map loops causes O(N * K) redundant scans on every render. Pre-computing counts in a single O(N) pass inside useMemo avoids unnecessary loop overhead.
**Action:** Always pre-compute aggregate statistics for array lists outside render loops using useMemo.
