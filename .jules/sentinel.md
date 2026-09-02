## 2026-08-20 - Nginx add_header Suppression Rule in Child Location Blocks
**Vulnerability:** Missing HTTP security headers on static asset responses when child location blocks use `add_header`.
**Learning:** In Nginx, if a child `location` block contains any `add_header` directive (e.g. `Cache-Control`), all `add_header` directives from parent blocks are overridden and omitted.
**Prevention:** Always re-declare essential security headers with the `always` parameter inside child `location` blocks that define custom headers.
