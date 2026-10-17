## 2025-05-18 - Single-Pass Log Filter Counts Optimization
**Learning:** In React components with filter tabs (such as log viewers), calculating category counts by invoking `array.filter()` for each tab option inside render maps creates redundant $O(N \times K)$ array scans on every render.
**Action:** Pre-compute tab category counts in a single $O(N)$ pass using a `useMemo` loop over the data collection before mapping over tab options.
