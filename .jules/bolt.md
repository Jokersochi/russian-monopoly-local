## 2025-05-18 - Pre-computing Player Net Worth and Owned Cells in PlayerPanel
**Learning:** Recalculating player properties and net worth values via cells.filter() and Array.includes() on every PlayerPanel re-render causes unnecessary O(P x C x props) scans.
**Action:** Pre-compute player statistics inside useMemo called unconditionally before early return statements in React components.
