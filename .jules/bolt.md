## 2026-09-27 - Pre-computing Player Statistics in PlayerPanel
**Learning:** Computing player property statistics with repeated cell filtering and array inclusions during renders creates redundant O(P * C) overhead on state updates.
**Action:** Use useMemo with Set lookups to batch pre-compute player statistics when board state or player properties change.
