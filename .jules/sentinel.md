## 2024-04-09 - [Nginx Header Inheritance Quirk]
**Vulnerability:** Security headers (CSP, X-Frame-Options, etc.) were missing from static asset responses.
**Learning:** In Nginx, `add_header` directives in a child `location` block completely override all `add_header` directives from parent blocks (like the `server` block). Adding a `Cache-Control` header for images was inadvertently clearing all security headers for those assets.
**Prevention:** Always re-declare or include global security headers in every `location` block that uses `add_header`, or use a separate include file to maintain consistency.
