## 2025-05-18 - Input Validation on Trade Money Values
**Vulnerability:** Trade offers accepted negative or non-finite numbers for offered/requested money, allowing players to manipulate money balances or corrupt state.
**Learning:** Unvalidated trade parameters allowed input-based financial manipulation in trade processing.
**Prevention:** Always validate all numeric parameters (ensuring non-negative, finite numbers) before applying state/financial updates.
