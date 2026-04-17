## 2026-04-14 - Infrastructure Security Headers Enhancement
**Vulnerability:** Missing defense-in-depth security headers (CSP, HSTS, X-Frame-Options, etc.) in deployment configurations.
**Learning:** Nginx header inheritance rules require repeating `add_header` directives in `location` blocks if those blocks define their own headers (like `Cache-Control` for static assets), otherwise the top-level headers are lost for those requests.
**Prevention:** Always verify header presence across different route types (static vs dynamic) when configuring Nginx, and ensure CSP is restrictive but permissive enough for the framework's needs (e.g., `unsafe-inline` for Vite/React styles).
