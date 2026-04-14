## 2026-04-14 - Optimize game state lookups in render loops
**Learning:** In React applications with complex game boards, performing O(N) or O(N*M) lookups (like finding an owner for each cell or players on a cell) inside a render loop can lead to significant performance degradation as the board or player count grows.
**Action:** Use `useMemo` to pre-calculate indexed Maps (e.g., Map<cellId, data>) to reduce lookup complexity from O(N) to O(1) within the render loop. Also, hoist static configuration objects and style helpers outside of component bodies to avoid redundant allocations.
