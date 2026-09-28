## 2026-09-28 - Precompute cell lookups and net worth standings in GameBoard
**Learning:** Computing cell owner lookups, player cell positions, and net worth standings inside the cell map loop in `GameBoard.tsx` causes O(C x P) array scans and object allocations on every render cycle. Pre-computing hash maps (`ownerByCellId` and `playersByCellId`) and standings with `useMemo` converts array scans into O(1) lookups.
**Action:** Use `useMemo` to precompute lookup maps and standings at the top level of board components.
