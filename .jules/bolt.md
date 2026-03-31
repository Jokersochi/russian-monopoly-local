## 2025-05-15 - [O(P*C) Complexity in Grid Rendering]
**Learning:** In grid-based board games (like Monopoly), mapping over cells and performing lookups for players/owners on each cell results in O(Players * Cells) complexity per render. With 40 cells and multiple players, this causes visible lag during state updates.
**Action:** Use `useMemo` to pre-calculate lookups into HashMaps (Objects/Maps) outside the render loop, reducing lookup complexity to O(1) per cell. Memoize individual cell components to skip re-renders for cells where no state changed.
