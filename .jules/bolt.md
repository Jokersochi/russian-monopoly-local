## 2026-10-20 - Pre-compute board lookups with useMemo
**Learning:** Unmemoized array scans in GameBoard (players.find, players.filter, and cells.filter) execute O(C * P * props) operations on every game state update.
**Action:** Use useMemo Map lookups and pre-computed rankings placed unconditionally before early guard returns.
