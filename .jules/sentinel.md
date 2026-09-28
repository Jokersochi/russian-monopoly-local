## 2026-09-28 - Input Validation in Game State Mutations
**Vulnerability:** Unsanitized numeric input in trades and auction bids allowed negative amounts or non-finite values, enabling money duplication exploits.
**Learning:** Frontend state mutation handlers must explicitly validate all numeric inputs against negative numbers, non-finite values (NaN/Infinity), and player balances before modifying state.
**Prevention:** Always validate monetary amounts using Number.isFinite() and non-negative bounds checks (>= 0 or > 0) in state mutation functions.
