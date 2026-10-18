## 2025-05-20 - Unvalidated Numeric Inputs in Game State Mutations
**Vulnerability:** Trade offers accepted negative money or non-finite numbers (NaN/Infinity) leading to unauthorized wealth transfer.
**Learning:** In-memory client state handlers often assume UI-level inputs are pre-sanitized, bypassing numeric bounds checks in core logic.
**Prevention:** Always validate numeric bounds and finiteness (Number.isFinite and >= 0) at state mutation boundaries regardless of UI constraints.
