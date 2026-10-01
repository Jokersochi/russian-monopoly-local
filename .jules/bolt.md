## 2025-05-10 - Memoized Board Cell Lookups
**Learning:** Replaces 40x linear array searches per render with single-pass O(1) Map lookups in GameBoard.
**Action:** Use useMemo maps before array iteration in board game components.
