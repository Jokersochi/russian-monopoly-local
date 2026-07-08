## 2026-04-19 - Single-pass Optimization for List Rendering and Aggregation
**Learning:** Consolidating multiple O(N) operations (cloning, reversing, filtering, and multiple counting passes) into a single backward pass within a `useMemo` hook significantly reduces render overhead for growing lists like game logs. This reduces complexity from $O(K \cdot N)$ (where $K$ is the number of filters/counts) to $O(N)$.
**Action:** When a component needs both a filtered list and counts for different categories of the same data, avoid multiple `.filter().length` calls. Use a single `for` loop or `reduce` inside `useMemo` to gather all necessary data in one traversal.
>>>>>>> REPLACE
