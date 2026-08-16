# Sentinel Agent Security Journal

## 2026-04-19 - CSS Injection Mitigation in ChartStyle
**Vulnerability:** Dynamic CSS variables and data-chart ID selectors in `ChartStyle` were interpolated directly into a `<style>` tag via `dangerouslySetInnerHTML` without sanitization.
**Learning:** Reusable Shadcn UI / Radix chart components generating dynamic inline CSS variables can be exploited for CSS injection or breaking out of style blocks if keys or theme values contain untrusted or special characters (e.g. `;`, `}`, `<`).
**Prevention:** Always sanitize dynamic keys and values rendered into `<style>` tags using strict character whitelist/blacklist rules (`sanitizeCssKey` and `sanitizeCssValue`).
