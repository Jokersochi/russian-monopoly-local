## 2025-05-18 - Negative Money Trade Vulnerability
**Vulnerability:** Negative trade offer amounts allowed bypassing wealth checks and generating unearned funds.
**Learning:** Financial bounds checks must explicitly verify non-negativity and finiteness using Number.isFinite().
**Prevention:** Always validate numeric transaction parameters with non-negative bounds checks before mutating player state.
