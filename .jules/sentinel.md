## 2025-05-15 - Nginx Security Header Inheritance
**Vulnerability:** Security headers (e.g., CSP, X-Frame-Options) were not being served for static assets (images, CSS, JS) despite being defined in the global server block of `nginx.conf`.
**Learning:** In Nginx, if a `location` block contains its own `add_header` directive (e.g., for `Cache-Control`), it does NOT inherit any `add_header` directives from the parent `server` block.
**Prevention:** Always re-declare or include global security headers within `location` blocks that use their own `add_header` directives to ensure consistent protection across all asset types.
