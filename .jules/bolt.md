## 2025-05-20 - Memoizing Board Lookups and Net Worth Calculations in GameBoard
**Learning:** In GameBoard.tsx, traversing player properties and position arrays inside 40 cell render loops causes repeated O(C * P) array scans per render frame. Pre-computing lookup maps with useMemo reduces render work to O(1).
**Action:** Use useMemo to map ownerByCellId and playersByCellId, and pre-compute net worth standings before board cell loops.
