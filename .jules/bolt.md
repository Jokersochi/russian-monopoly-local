## 2025-05-20 - PlayerPanel Memoization Optimization
**Learning:** In PlayerPanel, recalculating owned properties, property values, house values, and net worth for all players on every render causes unnecessary array filtering and iterations during frequent game actions.
**Action:** Pre-compute player statistics inside a useMemo hook with player properties, houses, and cells dependencies to eliminate redundant computations.
