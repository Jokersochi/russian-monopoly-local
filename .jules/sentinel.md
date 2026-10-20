## 2026-10-20 - Trade Money Validation
**Vulnerability:** Trade offers allowed negative or non-finite money values, allowing players to steal money or set balances to NaN.
**Learning:** Input validation for trade/financial operations must explicitly check for non-negative finite numbers.
**Prevention:** Use isValidTradeMoney helper function to validate money parameters before processing financial exchanges.
