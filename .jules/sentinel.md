## 2026-04-14 - Defense-in-Depth via Security Headers
**Vulnerability:** Missing security headers (CSP, HSTS, X-Frame-Options, etc.) in deployment configurations.
**Learning:** Modern SPAs often focus on application logic and miss server-level security configurations, especially when multiple deployment targets (Nginx/Vercel) are used.
**Prevention:** Always implement a baseline of security headers in all deployment-related configuration files (nginx.conf, vercel.json, etc.) and ensure consistency between them.
