## 2025-05-20 - Single-Pass Log Entry Filtering with useMemo

**Learning:** Reversing and filtering arrays while calling repeated count helpers inside JSX render loops causes O(9N) array traversals and redundant memory allocations on every render.

**Action:** Consolidate array reversing, filtering, and type counting into a single O(N) backward pass inside useMemo.
