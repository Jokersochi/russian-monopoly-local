## 2026-04-14 - Map-based GameBoard lookups
**Learning:** In React components with loops (like GameBoard cells), using .find() or .filter() inside the loop causes O(N*M) complexity. Pre-calculating a Map reduces this to O(1) inside the loop and improves performance significantly.
**Action:** Always check for nested array operations in render loops and hoist them using useMemo and Map/Set lookups.
