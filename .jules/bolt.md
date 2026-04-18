## 2026-04-14 - Map-based lookup optimization for GameBoard
**Learning:** Performing array searches (`find`, `filter`, `includes`) inside a loop (like `.map` over board cells) creates O(N*M) complexity that scales poorly. Pre-calculating these relationships into Maps using `useMemo` reduces this to O(N+M).
**Action:** Always check for nested array operations in render loops, especially when rendering fixed-size collections like game boards or large lists.
