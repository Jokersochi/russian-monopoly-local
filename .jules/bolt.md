## 2026-04-19 - Avoid including volatile object references in effect dependencies for timers

**Learning:** Including a whole state object reference (like `gameState`) alongside a stringified state derivative (like `playerPositionsKey`) in a `useEffect` dependency array causes the effect cleanup function to execute on *every* state update, prematurely clearing timers (like `setTimeout` for landing highlight animations).
**Action:** Only include derived string/primitive keys in dependency arrays when tracking specific state subset changes.
