## 2026-04-14 - Map-based lookup optimization in GameBoard
**Learning:** Performing linear searches (find/filter) inside a loop that renders 40+ cells results in O(N*M) complexity. Pre-calculating these into a Map using useMemo reduces it to O(1) lookups.
**Action:** Always check for array methods like `find` or `filter` inside `.map()` render loops and consider pre-calculating a Map or object if the source data is stable during that render cycle. Ensure optional chaining is used inside the useMemo to prevent crashes when the state is null.
