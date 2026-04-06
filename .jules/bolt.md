# Bolt Journal

## 2024-05-15 - Render Loop Lookups
**Learning:** In game components like GameBoard or PlayerPanel, performing O(N) or O(N*M) lookups (like .find or .filter) inside a map() function leads to O(N^2) complexity on every render.
**Action:** Pre-calculate Map-based lookups or use direct property access (e.g., .length) using useMemo to reduce lookup time to O(1) during the render phase.
