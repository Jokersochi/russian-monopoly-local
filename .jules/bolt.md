## 2026-10-12 - Memoize Cell Ownership and Standings in GameBoard
**Learning:** Destructuring gameState properties with defaults (e.g. `const { players = [] } = gameState || {}`) prior to useMemo hooks ensures React Rules of Hooks compliance while enabling O(1) Map lookups for board cell renders.
**Action:** Always place memoized Map lookups at top-level component scope using default destructured properties when working with potentially null context state.
