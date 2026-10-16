## 2025-05-18 - Pre-computing Board Color Groups
**Learning:** Dynamic filtering of static board data like `BOARD_CELLS` inside core game loop functions (`calcRent`, `buildHouse`) causes redundant array allocations during state calculations.
**Action:** Pre-compute static relationships like color groups at module level into constant lookup tables or Maps.
