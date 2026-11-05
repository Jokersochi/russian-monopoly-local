## 2026-10-09 - Memoize GameBoard cell lookups and net worth standings
**Learning:** Computing player property values, cell owners, and player cell locations directly in the render body of GameBoard causes redundant O(C * P) array scans on every frame/animation tick. Pre-computing maps with useMemo reduces render lookup complexity to O(1).
**Action:** Use useMemo to pre-index relational state like cell ownership and player positions when rendering large game boards.
