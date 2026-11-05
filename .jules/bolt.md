## 2025-05-18 - Memoizing Board Cell Lookups and Standings
**Learning:** Destructuring players and houses with default fallbacks allows creating stable useMemo lookups for board cell owners and player positions, avoiding O(C * P) array scans on every board render frame.
**Action:** Pre-compute Map lookups for grid cell properties in React board games whenever render calls iterate over fixed cell counts.
