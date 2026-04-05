## 2026-04-05 - Optimize GameBoard cell lookups
**Learning:** In React components with large loops (e.g., 40 board cells), performing nested lookups (e.g., searching players or ownership) results in O(N*M) complexity on every render.
**Action:** Use `useMemo` and `Map` to pre-calculate lookups at the component level, reducing render complexity to O(N).
