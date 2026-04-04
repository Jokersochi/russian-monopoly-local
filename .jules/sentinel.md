## 2025-05-22 - [Security Headers for Global Coverage]
**Vulnerability:** Missing or inconsistent security headers (CSP, X-Frame-Options, Permissions-Policy) across different deployment environments (Vercel and Nginx).
**Learning:** In Nginx, headers defined at the `server` level are not inherited by `location` blocks that define their own headers (like static assets with `Cache-Control`).
**Prevention:** Always duplicate global security headers in every `location` block that uses the `add_header` directive to ensure consistent protection.
