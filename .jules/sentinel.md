## 2026-08-20 - Nginx add_header Directive Inheritance
**Vulnerability:** HTTP security headers defined at server block level were overridden and dropped in static asset location blocks due to Nginx header inheritance behavior when child blocks use `add_header`.
**Learning:** Nginx `add_header` directives in a parent context are suppressed if the inner `location` block also specifies any `add_header` directive.
**Prevention:** Always re-declare essential security response headers with the `always` parameter in all `location` blocks that use `add_header`.
