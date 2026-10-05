## 2026-10-05 - Pre-computing GameBoard Cell Lookups
**Learning:** In React components rendering large fixed grids (e.g. 40 board cells), calling array methods like `.find()` or `.filter()` inside loop iterations on every render creates $O(C \times P)$ overhead. Pre-computing Map lookups with `useMemo` converts cell loop lookups to $O(1)$.
**Action:** Always pre-compute grid cell ownership and player locations into Maps using `useMemo` outside of JSX loops.
