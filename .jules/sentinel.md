## 2025-05-18 - Unvalidated Local Storage Deserialization DoS
**Vulnerability:** LocalStorage saved state JSON was deserialized directly into React context state without structural validation, causing application crashes on malformed data.
**Learning:** Applications reading persisted client-side state must strictly validate schema/types before placing state into context or calling array methods.
**Prevention:** Use type guards (`isValidGameState`) before applying parsed JSON data into application state.
