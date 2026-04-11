## 2025-05-14 - [React Render Loop Optimizations]
**Learning:** In high-frequency rendering components like game boards, nested array lookups (O(N*M)) create significant performance debt. Transitioning to pre-calculated Map-based lookups in `useMemo` provides a measurable speed boost (O(1) lookups during render).
**Action:** Always check for array searches inside `.map()` calls in JSX and prefer pre-calculating index maps if the data is relatively static between renders.

## 2025-05-14 - [Redundant Property Count Filtering]
**Learning:** Filtering a master cell list to count properties owned by a player is O(N) where N is the number of cells. Since player objects often already track owned IDs, using the `.length` of that ID array is O(1) and eliminates unnecessary computation.
**Action:** Favor direct property length checks over filtering global state for ownership counts.
