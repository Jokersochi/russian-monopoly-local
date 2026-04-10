## 2025-04-10 - Nginx Header Inheritance Shadowing
**Vulnerability:** Missing security headers on static assets.
**Learning:** In Nginx, `add_header` directives in a `location` block override all `add_header` directives in the parent `server` block. If you add `Cache-Control` in a location block, you must also re-declare all security headers in that same block.
**Prevention:** Always re-apply global security headers in any `location` block that uses `add_header`, or use a configuration snippet/include to ensure consistency.
