## 2025-05-15 - GameBoard Optimization
 **Learning:** In board game logic, frequently re-calculating player positions and property ownership within a render loop (e.g., inside a map of 40 cells) can lead to O(N*M) complexity, where N is the number of cells and M is the number of players.
 **Action:** Use `useMemo` to pre-calculate these lookups into a Map or object once per game state update, reducing the complexity to O(N + M) and improving rendering performance.
