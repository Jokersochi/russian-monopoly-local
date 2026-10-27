## 2025-05-18 - Input Validation for Trade Money
**Vulnerability:** Players could exploit trade offers with negative money amounts to drain money from other players or inflate their own money balance.
**Learning:** Checking bounds without checking non-negativity or finite number checks allows negative numbers to manipulate basic arithmetic expressions.
**Prevention:** Always validate all numeric user inputs using `Number.isFinite(value) && value >= 0` before modifying game state.
