## 2025-05-14 - [O(1) Lookups in GameBoard Render Loop]
**Learning:** Performing O(N) or O(N*M) searches (like `find` or `filter` on nested arrays) inside a React render loop for a repeated element (like board cells) creates a significant performance bottleneck as the game state grows. Using `useMemo` to pre-calculate `Map` objects for these lookups reduces complexity to O(1) per element.
**Action:** Always audit render loops for nested array searches and replace them with memoized Map/Object lookups if the data structure allows.
