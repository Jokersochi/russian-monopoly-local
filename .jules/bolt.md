## 2025-05-18 - Memoizing Board State Lookups
**Learning:** Computing property ownership, player cell positions, and net worth standings on every GameBoard render causes repeated O(C * P) array scans and allocations across 40 cells.
**Action:** Pre-compute lookup maps (ownerByCellId, playersByCellId) and standings using useMemo with safe default values for gameState to achieve O(1) cell renders.
