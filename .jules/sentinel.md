## 2026-04-14 - Nginx Header Inheritance Security Risk
**Vulnerability:** Missing security headers on static assets.
**Learning:** `add_header` directives in an Nginx `location` block override all `add_header` directives in the parent `server` block. If you define headers for static assets (like `Cache-Control`), you must re-declare all security headers in that block to ensure they are sent.
**Prevention:** Always re-include security headers in Nginx location blocks that use `add_header`, or use a separate configuration file to include them in both places.
