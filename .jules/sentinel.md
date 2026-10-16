## 2025-05-18 - Trade Offer Money Validation
**Vulnerability:** Trade offers accepted negative or non-finite money values, allowing players to steal funds or corrupt state.
**Learning:** Client-side form controls without context-level numeric bounds checks can be exploited via state manipulation.
**Prevention:** Always validate numeric range (non-negative, finite) at the state transition handler in addition to UI inputs.
