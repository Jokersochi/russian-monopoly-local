## 2025-05-18 - CSS Injection in ChartStyle dangerouslySetInnerHTML
**Vulnerability:** Unsanitized chart config keys, values, and element IDs were directly interpolated into a `<style>` element rendered via `dangerouslySetInnerHTML`.
**Learning:** Even utility style tags can become XSS or CSS injection attack vectors when user-controlled or dynamic keys/color strings contain characters like `}`, `;`, or `</style>`.
**Prevention:** Always sanitize dynamic property keys with `[^\w-]` and CSS values with `[^\w\s#.,()%/-]` before constructing raw CSS strings for `dangerouslySetInnerHTML`.
