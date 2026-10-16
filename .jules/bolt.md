## 2025-05-18 - Memoize player stats calculations in PlayerPanel
**Learning:** `PlayerPanel` rendered on every UI state change (like toggling card expansion) and re-calculated player financial stats with 4 separate `.filter()` and `.reduce()` passes per player using `Array.includes()`.
**Action:** Pre-compute player stats inside `useMemo` with `Set.has()` for $O(1)$ property lookups and single-pass iteration per player.
