## 2025-05-18 - Validate Monetary Transaction Bounds
**Vulnerability:** Missing non-negative and finite bounds checks on trade and auction monetary inputs allowed negative money transfers.
**Learning:** Context action handlers trusted input values without verifying mathematical constraints.
**Prevention:** Always validate all monetary inputs with Number.isFinite() and non-negative bounds before mutating game state.
