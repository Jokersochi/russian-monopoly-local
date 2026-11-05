## 2026-10-22 - Pre-computed Board Lookups in GameContext
**Learning:** Dynamic filtering over static board arrays inside frequent calculation functions like `calcRent` and `buyHouse` creates unnecessary O(C) array allocations. Pre-computing static color and type lookups at module load provides O(1) group access and eliminates redundant board scans.
**Action:** Always pre-compute static entity groupings at module initialization rather than re-filtering on every calculation.
