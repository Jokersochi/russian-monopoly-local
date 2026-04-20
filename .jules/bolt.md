## 2026-04-19 - GameBoard Render Complexity
**Learning:** The board rendering logic in `GameBoard.tsx` was performing $O(\text{Players})$ lookups (using `find` and `filter`) inside a loop over 40 cells, leading to $O(\text{Cells} \times \text{Players})$ total complexity per render.
**Action:** Use `useMemo` to pre-calculate `Map` lookups for property ownership and player positions, reducing the complexity to $O(\text{Cells} + \text{Players})$. This pattern should be applied to any grid or board rendering that depends on a flat list of entities.
