## 2025-05-15 - Security Header Inheritance in Nginx
**Vulnerability:** Missing security headers on static assets.
**Learning:** In Nginx, if a child block (like `location ~* \.(...)$`) contains any `add_header` directive, it does not inherit any `add_header` directives from the parent `server` block. This often leads to security headers being present on the main HTML but missing on all JS, CSS, and image files.
**Prevention:** Always re-declare or use an include file for security headers in any location block that needs to add its own headers (like `Cache-Control`).
