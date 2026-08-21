## 2026-08-20 - Memoized GameBoard lookups & Standings
**Learning:** In React components rendering 40+ cells with dynamic player positions and property ownerships, evaluating `array.find` and `array.filter` for every cell per render frame scales at $O(Cells \times Players)$ and causes unnecessary layout re-evaluations.
**Action:** Use a single-pass `useMemo` at the top level to construct $O(1)$ Map lookups for property ownership and player cell locations, and precompute standings in a single pass.
