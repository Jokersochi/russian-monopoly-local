## 2026-09-26 - Pre-compute Player Statistics in PlayerPanel
**Learning:** Re-calculating player financial statistics on every render in PlayerPanel introduces redundant array scans and filter operations across all players.
**Action:** Use useMemo with Set-based lookups to pre-compute player statistics in a single pass.
