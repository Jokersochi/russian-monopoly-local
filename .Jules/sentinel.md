## 2025-05-22 - [Security Headers and CSP Implementation]
**Vulnerability:** Missing standard security headers (CSP, X-Frame-Options, X-Content-Type-Options) in production configuration.
**Learning:** For a Vite-based SPA, security headers are most effective when configured at the server level (e.g., `vercel.json` and `nginx.conf`) to ensure coverage of all responses, including static assets. The production build of this app does not require `'unsafe-eval'` in its CSP, which allows for a stricter policy.
**Prevention:** Always include a baseline security header configuration in deployment manifests (`vercel.json`, `nginx.conf`, etc.) and avoid redundant, less effective CSP meta tags in `index.html`.
