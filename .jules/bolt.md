## 2026-08-20 - GameBoard Cell & Standings Memoization
**Learning:** Pre-computing cell ownership, player positions, and player net worth standings into useMemo maps converts O(C * P) array scans into O(1) lookups during render loops.
**Action:** Always pre-compute indexed lookups for nested map renders.
