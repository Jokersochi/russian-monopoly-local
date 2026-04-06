## 2025-05-14 - Security Hardening: Headers and Data Validation
**Vulnerability:** Missing security headers (CSP, X-Frame-Options, etc.) and unvalidated JSON parsing of localStorage data.
**Learning:** Security headers should be configured consistently across all deployment environments (Vercel and Nginx). In Nginx, headers in location blocks must be re-declared if the block has its own add_header directive. localStorage data should always be treated as untrusted and validated before use.
**Prevention:** Implement a global security header strategy and use schema-based or property-based validation for any data retrieved from browser storage.
