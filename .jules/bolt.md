## 2025-05-18 - Pre-compute Static Color Groups
**Learning:** Pre-computing static board color groupings at module load time eliminates redundant O(N) array filtering on BOARD_CELLS during rent and house construction calculations.
**Action:** Always pre-compute static property/group maps outside React components or render loops when data structures are immutable.
