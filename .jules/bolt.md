## 2025-05-18 - Pre-compute Map lookups for board cell ownership and player positioning
**Learning:** In board game UIs with frequent renders (e.g. timer ticks, dice rolls), repeated O(C * P) array scans across all board cells cause unnecessary render lag. Pre-computing Map lookups using useMemo before early return guards reduces lookups to O(1) safely.
**Action:** Always pre-compute Map lookups using useMemo unconditionally before guard returns when mapping indexed collections.
