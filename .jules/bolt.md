## 2025-05-15 - [GameBoard complexity reduction]
**Learning:** The GameBoard was performing nested lookups (find/includes) for each cell during render, leading to O(Cells * Players * Properties) complexity. Moving these to Map-based lookups pre-calculated in useMemo reduces the complexity to O(Players * Properties + Cells).
**Action:** Always prefer Map-based lookups for entity-to-entity relations (like player-to-property or player-to-position) in React render loops to ensure O(1) access.
