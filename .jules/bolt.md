## 2025-05-18 - Memoize GameBoard map lookups
**Learning:** Pre-computing cell ownership and player positions into Map structures eliminates O(C * P) array scans across 40 board cells on every re-render.
**Action:** Use Map indexed lookups in useMemo for repeated collection lookups during board renders.
