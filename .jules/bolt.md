## 2026-04-19 - Map-based lookups and memoized standings for Board components

**Learning:** Iterating over 40 cells in a React board component and performing $O(\text{Players})$ array searches (`players.find`, `players.filter`) on each cell causes heavy redundant calculations on every state update. In addition, computing net worth standings inside the render loop by filtering property arrays twice per player creates unnecessary array allocations.

**Action:** Consolidate player positions, property ownership, and net worth calculations into a single $O(P \cdot K)$ pass inside a top-level `useMemo` hook, building $O(1)$ `Map` lookups for cell owners and player positions while providing memoized standings.
