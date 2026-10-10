## 2026-10-10 - Memoize GameBoard cell lookups and standings
**Learning:** In GameBoard, linear searches across all players for each of the 40 cells and inline net worth array filtering inside JSX caused O(C * P) computation on every render. Memoizing these into Map lookups converts render loops to O(1) access.
**Action:** Always pre-compute board cell indices and standings using useMemo with default destructured state parameters to avoid Rules of Hooks errors and linear render overhead.
