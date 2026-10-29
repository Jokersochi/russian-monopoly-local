## 2026-10-25 - Pre-computing Map Lookups and Net Worth in GameBoard
**Learning:** Re-evaluating player ownership and cell positions using array scans (`find`/`filter`) across 40 board cells on every render creates high CPU overhead. Memoizing these into Map lookups and net worth calculations reduces render complexity from O(C * P) to O(1) lookups per cell.
**Action:** Use Map indexed lookups in useMemo for repeated board cell queries.
