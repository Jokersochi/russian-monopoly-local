## 2025-05-15 - Optimizing Game Board and Player Panel Lookups
**Learning:** In the GameBoard component, calculating player positions and property ownership inside the render loop was causing O(N*M) complexity. Pre-calculating these into Maps using useMemo reduces it to O(1) lookups.
**Action:** Always check for repeated array scans (find, filter) inside loops, especially when the arrays (like players or properties) can grow or are used in multiple places within the same render.
