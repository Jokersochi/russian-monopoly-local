## 2025-05-18 - Memoize GameBoard cell owner and leaderboard computations
**Learning:** Computing player net worth and searching cell ownership via unmemoized filter/find calls inside nested board render loops creates thousands of unnecessary array traversals per animation frame. Pre-indexing property ownership and player positions into Map lookups via useMemo reduces render lookup overhead to O(1).
**Action:** Use Map-based indexed lookups with useMemo in multi-element grid and board render components.
