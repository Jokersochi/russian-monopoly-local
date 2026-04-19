## 2026-04-19 - Optimizing GameBoard lookups

**Learning:** In a Monopoly-style board game, rendering the board often involves repeated O(N*M) searches (e.g., checking which player owns a cell or which players are on a cell). As the game state grows, these lookups can become a bottleneck during React render cycles.

**Action:** Use `useMemo` to pre-calculate Maps for property ownership and player positions. This converts O(N) or O(N*M) lookups into O(1) lookups, significantly reducing the computational cost of each frame, especially during animations or state updates.
