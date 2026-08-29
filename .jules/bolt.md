## 2026-08-20 - Memoizing Standings Calculations with O(1) Lookups
**Learning:** Precalculating net worth standings using `Map<number, Cell>` lookups inside a top-level `useMemo` hook reduces nested array filtering complexity from $O(P \times C)$ per render frame to $O(C + P \times K)$ while preventing extraneous calculations during unrelated component state renders.
**Action:** When component JSX renders sorted/aggregated stats derived from relational entities, precalculate them in `useMemo` with Map lookups instead of performing inline array operations.
