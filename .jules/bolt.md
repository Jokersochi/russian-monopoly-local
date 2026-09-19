## 2026-08-20 - Hoisting Static Pattern Data in Dice Roller
**Learning:** In animated components like `DiceRoller`, allocating static arrays (e.g. `[...Array(9)]`) and inline dictionaries on every render frame creates unnecessary garbage collection pressure. Hoisting static data structures to module scope eliminates per-frame heap allocations.
**Action:** Always hoist static render configuration maps and grid indices outside React component functions.
