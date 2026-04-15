## 2026-04-14 - Nginx Header Inheritance Security Risk
**Vulnerability:** Security headers defined at the `server` level in Nginx are lost when a `location` block defines its own `add_header` (e.g., for `Cache-Control`).
**Learning:** Nginx's `add_header` directive does not inherit from parent blocks if the current block also contains an `add_header` directive. This can lead to a false sense of security where one thinks global headers are applied to all responses, while in reality, static assets or specific routes are unprotected.
**Prevention:** Always repeat core security headers in `location` blocks that define their own headers, or use a separate configuration file to `include` them in every block.
