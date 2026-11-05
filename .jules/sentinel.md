## 2026-11-05 - Insecure GameState Deserialization from LocalStorage
**Vulnerability:** Saved game states read from browser `localStorage` were passed directly to `JSON.parse` and hydrated into state without schema validation, causing denial of service (render crashes) and corrupt game state if keys were manipulated or malformed.
**Learning:** Browser storage is client-controlled and cannot be trusted as structurally valid; directly casting parsed JSON to complex domain types bypasses TypeScript safety at runtime.
**Prevention:** Implement structural runtime validators (`isValidGameState`) that verify property types, array bounds, safe integer constraints, and required fields before state hydration.
