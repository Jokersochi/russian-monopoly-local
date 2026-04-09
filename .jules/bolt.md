## 2025-05-15 - [O(1) Map Lookups in Render Loops]
**Learning:** In components with high-frequency rendering of many items (like a 40-cell game board), nested O(N) searches (like `find` or `filter` on player lists) quickly degrade performance to O(N*M). Using `useMemo` to pre-calculate `Map` lookups reduces this to O(1) per item.
**Action:** Always check for array searches inside `.map()` calls for game boards or lists, and replace them with Memoized Maps if N > 10.

## 2025-05-15 - [React Hook Order and Conditionals]
**Learning:** When adding `useMemo` for performance optimizations, hooks must be placed before early returns (e.g., `if (!gameState) return null`) to maintain consistent hook execution order across renders.
**Action:** Place performance-related hooks at the very top of the component body, ensuring they handle nullable states internally if necessary.
