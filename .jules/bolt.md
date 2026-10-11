## 2026-10-11 - GameBoard Cell Lookups and Hook Rules
**Learning:** Searching arrays inside cell map loops (40 cells) creates (C 	imes P)$ overhead per render. Pre-computing lookup maps with `useMemo` turns lookups into (1)$. When adding `useMemo` to components with conditional early returns (e.g., `if (!gameState) return null;`), destructure defaults before hook invocation to prevent `react-hooks/rules-of-hooks` lint errors.
**Action:** Always pre-compute map lookups for board cell renders and ensure all React hooks run unconditionally before early returns.
