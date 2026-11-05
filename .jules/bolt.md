## 2025-05-18 - Memoize GameBoard Cell Lookups
**Learning:** Recomputing cell ownership and player locations inside the board render loop causes redundant O(C * P) calculations on every state change.
**Action:** Pre-compute lookup maps using useMemo to convert board cell lookups to O(1) constant time.
