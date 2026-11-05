## 2026-10-15 - Memoize Board Lookups and Leaderboard Calculations
**Learning:** Computing cell owner lookups (O(C × P)) and player net worth calculations (O(P × C)) inline during `GameBoard` renders creates unnecessary computational overhead on every frame or state change.
**Action:** Use `useMemo` hooks placed before guard returns to pre-compute O(1) lookup maps and rankings when dependencies (`players`, `houses`, `cells`) update.
