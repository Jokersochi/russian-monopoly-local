## 2025-05-18 - Input Validation for Trade Financial Amounts
**Vulnerability:** Trade offers allowed negative or non-finite numbers for monetary amounts, bypassing funds validation and causing balance theft or NaN state corruption.
**Learning:** Checking relative balances (`from.money < offer.offeredMoney`) without validating that inputs are finite non-negative numbers allows negative values to evaluate as valid and invert arithmetic operations.
**Prevention:** Always strictly validate numerical inputs with `typeof val === 'number' && Number.isFinite(val) && val >= 0` before performing financial transactions or state mutations.
