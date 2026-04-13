## 2025-05-14 - Nginx Header Inheritance Security Risk
**Vulnerability:** Missing security headers on static assets when using Nginx.
**Learning:** In Nginx, adding an `add_header` directive (like `Cache-Control`) inside a `location` block causes it to inherit NO headers from the parent `server` block.
**Prevention:** Always repeat global security headers within `location` blocks that define their own headers to ensure consistent defense-in-depth.
