## 2026-10-29 - Avoid Memoizing Cold-Path Derived Values in Action Panels
**Learning:** Derived values used only during rare game events (e.g., bankruptcy phase handling) add hook dependency evaluation overhead on every render of normal turns without rendering performance gains.
**Action:** Focus memoization on high-frequency render paths (like event logs, board cell updates, or active player status) that update during routine gameplay loops.
