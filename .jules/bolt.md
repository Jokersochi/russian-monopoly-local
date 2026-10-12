## 2025-05-18 - Memoize GameLog Filter Counts
**Learning:** Computing log category counts in render loops via repeated array filtering causes $O(N \times K)$ array traversals on every render. Pre-computing counts in a single $O(N)$ pass with `useMemo` eliminates redundant log scans during re-renders.
**Action:** Pre-compute filter category counts in a single pass with `useMemo` when rendering filter UI controls.
