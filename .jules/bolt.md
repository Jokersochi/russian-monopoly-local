## 2026-10-03 - GameBoard O(1) Map Lookups and Standings Memoization
**Learning:** In GameBoard, iterating through 40 cells and calculating owner/player locations via O(P) array filters per cell caused O(C * P) overhead per render. Pre-computing lookup Maps and memoizing standings converted cell renders to O(1) operations.
**Action:** Use Map lookups for repeated cell/entity queries in game board loops.
