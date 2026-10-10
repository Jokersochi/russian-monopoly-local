## 2025-05-18 - Sanitize dynamic inputs in inline style tags
**Vulnerability:** Dynamic chart container IDs, keys, and CSS color values were directly interpolated into `<style dangerouslySetInnerHTML=...>` without escaping or sanitization.
**Learning:** Even when using standard component libraries, dynamic strings rendered inside `<style>` or `<script>` tags can lead to CSS injection and XSS if user-controlled or untrusted values are passed.
**Prevention:** Always validate or strip non-whitelisted characters (using regex like `/[^\w-]/g` and `/[^\w\s#.,()%/-]/g`) before injecting dynamic values into inline style elements.
