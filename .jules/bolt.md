## 2026-08-20 - Memoized Single-Pass Processing in GameLog
**Learning:** In GameLog.tsx, log entries and type counts were computed using multiple slice(), reverse(), and filter() calls during render, resulting in 10 array passes per state update. Memoizing a single backward pass reduces complexity from 10N to 1N.
**Action:** Use single-pass useMemo data structures when rendering filtered/counted collections in React components.
