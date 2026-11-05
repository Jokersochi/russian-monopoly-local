## 2025-05-18 - Memoize GameBoard cell lookups and standings
**Learning:** Computing cell owners with O(P * props) array searches and recalculating net worth standings inside GameBoard render loop caused excessive O(C * P) overhead per render frame.
**Action:** Pre-compute cell ownership and player location Maps and memoize net worth standings with useMemo before early guard returns.
