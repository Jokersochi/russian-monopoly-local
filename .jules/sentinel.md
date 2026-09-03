## 2026-08-20 - Nginx Header Inheritance Suppression in Multi-Location Configurations
**Vulnerability:** HTTP security headers added at the `server` block level are completely suppressed in inner `location` blocks (such as static asset rules) whenever the inner location defines any `add_header` directive (e.g. `add_header Cache-Control`).
**Learning:** Nginx does not merge `add_header` directives from parent contexts if a child context defines its own `add_header`.
**Prevention:** Always duplicate required security headers in all `location` blocks that define custom `add_header` directives, and include the `always` parameter to ensure headers are sent even on error responses.
