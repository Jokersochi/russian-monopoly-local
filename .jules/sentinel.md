## 2025-05-18 - Negative Trade Money Exploit
**Vulnerability:** Trade offers accepted negative or non-finite monetary values in executeTrade, allowing players to generate money.
**Learning:** In-game financial operations must defensively validate numeric bounds independently of UI controls.
**Prevention:** Sanitize numeric inputs for financial transactions using Number.isFinite and non-negative checks.
