## 2025-05-15 - Nginx Header Inheritance Scoping
**Vulnerability:** Security headers (e.g., `nosniff`, `CSP`) not applied to static assets in Nginx.
**Learning:** In Nginx, headers defined within a specific `location` block are not inherited by other sibling `location` blocks (such as those for static assets).
**Prevention:** Always define global security headers at the `server` level in `nginx.conf` to ensure coverage for all request types, including JavaScript and CSS files where `nosniff` is critical.
