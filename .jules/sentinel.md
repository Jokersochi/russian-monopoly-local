## 2025-02-21 - CSS Injection Prevention in Dynamic Style Tag
**Vulnerability:** Unsanitized keys and color property strings passed to ChartStyle were injected directly into dangerouslySetInnerHTML within a style element.
**Learning:** Dynamic CSS rule generation from user or config object properties must sanitize key identifiers and property values to restrict allowed characters.
**Prevention:** Use sanitizeCssKey and sanitizeCssValue helper functions before string interpolation into style tags.
