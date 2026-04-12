## 2026-04-12 - Defense-in-Depth with Security Headers
**Vulnerability:** Lack of security headers (CSP, X-Frame-Options, etc.) exposed the application to clickjacking, MIME-sniffing, and XSS.
**Learning:** Nginx's `add_header` inheritance is tricky; adding a header in a `location` block wipes out all headers defined in the `server` block for that location.
**Prevention:** Always re-declare or include global security headers in specific location blocks that use `add_header` (like for caching), and ensure consistent configuration across different deployment platforms (Nginx/Docker and Vercel).
