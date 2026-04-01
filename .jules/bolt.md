## 2026-04-01 - [Board Component Optimization]
**Learning:** In board-game-like applications with many static elements (cells) and few dynamic elements (players), iterating through all cells while performing linear searches for players ($O(\text{Cells} \times \text{Players})$) is a common rendering bottleneck.
**Action:** Use `useMemo` to pre-calculate player-to-cell maps and wrap cell components in `React.memo` to skip re-renders for cells that haven't changed.
