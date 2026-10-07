## 2025-05-18 - Single-pass GameLog memoization
**Learning:** In React components with log filtering and type counting UI, calling multiple `.filter()` functions inside render loops for each filter option causes $O(K \times N)$ redundant array scans. Computing reversed arrays, counts, and filtered results in a single backward pass inside `useMemo` reduces overhead to a single $O(N)$ pass.
**Action:** Use a single-pass loop inside `useMemo` to compute filtered lists and badge counts simultaneously for log/feed components.
