## 2026-08-20 - Nginx Header Inheritance Suppression Security Gap
**Vulnerability:** Missing HTTP Security Headers (X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy) in Nginx static assets location blocks.
**Learning:** In Nginx, defining any `add_header` directive inside a child `location` block (such as `location ~* \.(js|css|...)`) completely suppresses all `add_header` directives from the parent `server` context unless explicitly duplicated.
**Prevention:** Always re-declare or include security headers with the `always` parameter inside all child `location` blocks that define custom headers (like `Cache-Control`).
