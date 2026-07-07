## 2026-04-19 - [GameBoard Optimization]
**Learning:** Complexity in React render loops (e.g., O(Cells * Players) to O(Cells + Players)) using Map-based lookups is a key performance pattern in this game codebase.
**Action:** Use `useMemo` to pre-calculate Map-based lookups for O(1) access when iterating over large arrays like `BOARD_CELLS`.
