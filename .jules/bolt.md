## 2026-10-15 - Pre-computing GameBoard Cell Lookups
**Learning:** In GameBoard.tsx, mapping 40 cells with nested player and property iterations triggered O(C * P) calculations every render. Pre-computing lookup maps (ownerByCellId, playersByCellId) and standings via useMemo reduces cell lookups to O(1).
**Action:** Use Map/Record lookups memoized before cell grid iteration when rendering board games or matrix lists in React.
