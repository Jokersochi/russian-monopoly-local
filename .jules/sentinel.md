## 2025-05-15 - Security Header Strategy
**Vulnerability:** Missing critical security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.).
**Learning:** Security headers should be configured in both `vercel.json` and the `server` block of `nginx.conf` for global coverage. In Nginx, headers defined with `add_header` in a parent block are NOT inherited by location blocks that contain their own `add_header` directive (e.g., for Cache-Control).
**Prevention:** Always re-declare security headers in Nginx location blocks that modify headers to ensure consistent protection across all assets.
