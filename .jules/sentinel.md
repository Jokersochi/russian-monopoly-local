## 2026-10-09 - CSS Injection Prevention in ChartStyle
**Vulnerability:** Unsanitized CSS key, value, and ID parameters interpolated directly into dangerouslySetInnerHTML style block.
**Learning:** Dynamic keys or color values in theme configuration can break out of CSS declarations if unescaped.
**Prevention:** Sanitize CSS custom property keys with /[^\w-]/g and CSS values with /[^\w\s#.,()%/-]/g before rendering.
