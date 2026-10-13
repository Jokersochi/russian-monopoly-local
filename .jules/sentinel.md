## 2025-05-18 - Monetary Input Validation in Trading and Auction Logic
**Vulnerability:** Unsanitized monetary amounts allowed negative value manipulation in trading and bidding.
**Learning:** Handled numerical parameters directly without bounds/finite checking, enabling game logic manipulation.
**Prevention:** Always sanitize numeric input with `Number.isFinite()` and explicit non-negative/positive bounds checks before mutating game state.
