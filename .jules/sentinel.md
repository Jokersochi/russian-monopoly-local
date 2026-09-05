## 2026-08-20 - CSS Injection in Inline Style Tags via dangerouslySetInnerHTML
**Vulnerability:** Dynamic chart theme keys and color values were directly interpolated into `<style dangerouslySetInnerHTML={...}>` in `ChartStyle` without sanitization.
**Learning:** React escapes strings rendered in standard JSX elements, but content inside `dangerouslySetInnerHTML` in `<style>` blocks bypasses React's HTML escaping and can lead to CSS Injection or XSS if string values contain CSS/HTML control characters.
**Prevention:** Always sanitize dynamic IDs, CSS keys, and CSS values with strict regex whitelists (`[a-zA-Z0-9_-]` for keys/selectors, `[a-zA-Z0-9_#%.,\s()/-]` for CSS values) before inserting into `dangerouslySetInnerHTML`.
