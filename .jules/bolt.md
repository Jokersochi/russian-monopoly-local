## 2025-05-20 - Pre-computing board lookup maps and leaderboard in React
**Learning:** Scanning player property arrays and position lists for all 40 board cells on every re-render creates redundant O(C * P * props) array allocations and lookups during active game interactions.
**Action:** Pre-compute indexed Maps (cell ID -> owner/players) and memoized net worth rankings unconditionally using `useMemo` before guard returns.
