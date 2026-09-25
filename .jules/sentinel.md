## 2026-09-25 - Monetary Validation & Safe LocalStorage Deserialization
**Vulnerability:** Monetary fields in `executeTrade` and `placeBid` lacked bounds and `Number.isFinite()` checks, permitting negative values and `NaN` state corruption. Additionally, `localStorage` state loading lacked structural array/object validation before access.
**Learning:** React context state handlers receiving external objects or state from `localStorage` must explicitly validate numeric bounds and structural types before mutating state.
**Prevention:** Always sanitize numeric values with `Number.isFinite()` and non-negative assertions, and validate JSON structures before calling array methods on untrusted storage.
