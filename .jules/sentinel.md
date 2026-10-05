## 2025-05-18 - CSS Injection in Chart Component
**Vulnerability:** Unsanitized key, value, and ID parameters in `<style dangerouslySetInnerHTML>` in `ChartStyle`.
**Learning:** Shadcn UI chart component injected raw string key, theme colors, and ID into inline CSS without escaping or sanitizing, creating CSS injection and XSS risks.
**Prevention:** Always sanitize dynamic strings before embedding them into inline `<style>` tags using strict character allowlists (`sanitizeCssKey` and `sanitizeCssValue`).
