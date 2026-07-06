## 2026-04-19 - Optimize GameBoard render efficiency
**Learning:** Complexity reduction in React render loops (e.g., O(Cells * Players) to O(Cells + Players)) using Map-based lookups is a key performance pattern in this game codebase. Also, moving variable assignments to the top level to comply with Rules of Hooks requires careful use of optional chaining to prevent runtime crashes on null states.
**Action:** Use Map-based lookups for frequent collection searches in render loops and always use optional chaining when accessing state properties hoisted above null guards.
