## 2026-08-20 - CSS Injection Mitigation in Dynamic Style Tags

**Vulnerability:** In `src/components/ui/chart.tsx`, `ChartStyle` rendered dynamic CSS variables and selectors directly inside `<style dangerouslySetInnerHTML={...}>` without sanitization. If dynamic keys or color strings contained HTML/CSS breakout characters (e.g. `</style><script>...`), it could lead to CSS injection or XSS.

**Learning:** Component libraries like Shadcn UI chart styles construct inline CSS strings. When these values rely on dynamic configuration objects, raw string interpolation into style tags bypasses React's JSX auto-escaping.

**Prevention:** Always sanitize dynamic key, value, and ID parameters with `sanitizeCssKey` (allowing `[a-zA-Z0-9_-]`) and `sanitizeCssValue` (allowing safe CSS color tokens like `[\w\s#.,()%/-]`) before embedding them in `<style dangerouslySetInnerHTML={...}>`.
