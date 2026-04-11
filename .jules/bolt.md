## 2024-03-24 - Optimization of critical board render loops
**Learning:** In game logic components like GameBoard, avoid O(N*M) lookups inside render loops by pre-calculating data structures (e.g., Map or objects) for property ownership and player positions using useMemo.
**Action:** When working on board games or data-heavy UI, always check for nested loops in the render function and move lookup logic to useMemo.
