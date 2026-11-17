## 2025-05-18 - Pre-compute GameBoard cell ownership and player positioning maps
**Learning:** Linear searching through players during board rendering (`players.find` and `players.filter` for each cell) causes $O(C \times P)$ overhead on every state update or animation frame.
**Action:** Pre-compute `ownerMap` and `playersByCellMap` using `useMemo` placed unconditionally before guard returns to achieve $O(1)$ lookup time per cell.
