## 2026-04-19 - Defense-in-Depth Security Headers
**Vulnerability:** Lack of security headers (CSP, HSTS, etc.) in deployment configurations.
**Learning:** Even if a production environment (like Vercel) provides some default protections, explicitly defining them in `vercel.json` and `nginx.conf` ensures consistent defense-in-depth across different hosting providers and local Docker environments.
**Prevention:** Always include a standard set of security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS) in the project's infrastructure-as-code or server configuration files.
