## 2026-08-20 - Memoizing Board Ownership and Standings Lookups
**Learning:** In `GameBoard.tsx`, calculating property ownership and net worth standings inside the render loop triggered $O(P \times C)$ linear searches on every frame.
**Action:** Precalculate ownership maps and sorted net worth standings inside a top-level `useMemo` hook using `Map<number, ...>` and direct array indexing for $O(1)$ cell lookups.
