## 2026-04-14 - Nginx Header Inheritance Pitfall
**Vulnerability:** Missing security headers on static assets.
**Learning:** In Nginx, using `add_header` within a `location` block causes it to ignore any `add_header` directives in the parent `server` or `http` blocks.
**Prevention:** Always re-declare security headers inside `location` blocks that add their own headers (like `Cache-Control` for static assets) to ensure consistent protection.
