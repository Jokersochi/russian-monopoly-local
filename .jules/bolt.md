## 2026-10-09 - Memoize Player Stats in PlayerPanel
**Learning:** In React components with interactive state (like expanding accordion items), recalculating array metrics on every render causes wasted cycles. Memoizing player statistics computations using a single-pass loop and Set lookups reduces rendering latency.
**Action:** Always compute derived player array statistics inside a useMemo hook with proper dependency tracking to isolate UI interaction state from heavy computations.
