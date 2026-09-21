## 2026-08-20 - CSS Injection Sanitization in Dynamic Style Tags
**Vulnerability:** Unsanitized dynamic inputs (chart ID, config keys, and color strings) injected directly into <style dangerouslySetInnerHTML={...}> tags allowing CSS injection and XSS breakout.
**Learning:** Dynamic CSS rule generation in React components must sanitize keys, values, and selectors to prevent CSS syntax breakouts and script injection via innerHTML.
**Prevention:** Use sanitizeCssKey (alphanumeric and hyphens/underscores) and sanitizeCssValue (strictly allowed CSS color characters) before rendering inside style tags.
