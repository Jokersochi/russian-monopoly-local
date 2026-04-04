## 2025-05-15 - Security Header Strengthening
 **Vulnerability:** Absence of strict security headers like Content-Security-Policy (CSP), X-Frame-Options, X-Content-Type-Options, and Referrer-Policy can expose the application to XSS, Clickjacking, and MIME-sniffing attacks.
 **Learning:** Security headers should be configured at the server level (e.g., `vercel.json` or `nginx.conf`) to ensure global coverage across all responses, including static assets, rather than just the main entry file.
 **Prevention:** Implement a baseline set of security headers for every deployment. Use a restrictive CSP that limits script sources and disallows `unsafe-eval` unless strictly necessary.
