## 2026-10-27 - Single-pass useMemo for game log category counts
**Learning:** Computing item counts by type across filter tabs using repeated `.filter()` calls inside render loops causes $O(N \times K)$ scans on every re-render.
**Action:** Use `useMemo` with a single $O(N)$ iteration over log entries to pre-calculate type frequencies for all filter tabs simultaneously.
