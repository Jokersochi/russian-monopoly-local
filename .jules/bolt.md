## 2026-08-20 - GameLog Single-Pass Memoization
**Learning:** Unmemoized array operations like `slice().reverse()`, `filter()`, and repeated predicate counts inside component render loops cause multiple array allocations and scans on every render. Processing the array in reverse order in a single pass inside `useMemo` memoized on array reference and filter state eliminates redundant allocations and scans.
**Action:** Always process log or event feed data with single-pass memoized computations when rendering filter badges or reversed lists.
