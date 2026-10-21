## 2025-05-18 - Pre-computing board map lookups in GameBoard
**Learning:** In GameBoard, calling array.find/filter per cell during renders results in O(C * P) scans on every tick or render. Pre-computing Map lookups (ownerMap, playersByCellMap) and leaderboard inside useMemo eliminates repetitive array scans and keeps board rendering fast.
**Action:** Always pre-compute cell/player relationship maps with useMemo in grid-based game boards before rendering cell loops.
