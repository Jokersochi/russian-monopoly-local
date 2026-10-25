## 2026-10-25 - Validate Money Values in Trade Offers
**Vulnerability:** Unchecked trade money input allowed negative numbers or non-finite values (NaN/Infinity) to bypass balance checks, potentially inflating player funds or exploiting trade arithmetic.
**Learning:** Checking `from.money < offer.offeredMoney` is insufficient when `offer.offeredMoney` is negative or NaN.
**Prevention:** Always sanitize numeric values with `Number.isFinite(val) && val >= 0` before executing state mutations or financial transactions.
