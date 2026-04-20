## 2026-04-20 - Defense-in-Depth Security Headers
**Vulnerability:** Missing security headers in production configuration.
**Learning:** Deployment configurations like `nginx.conf` and `vercel.json` are critical for enforcing security policies (CSP, HSTS, etc.) at the infrastructure level. In Nginx, `add_header` in a `location` block wipes out parent headers, so they must be re-declared or included.
**Prevention:** Always include a standard set of security headers in all deployment targets. Use the `always` parameter in Nginx to ensure protection on error pages.
