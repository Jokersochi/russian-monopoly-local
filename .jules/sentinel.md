## 2026-08-20 - Sanitize dynamic CSS in ChartStyle dangerouslySetInnerHTML

**Vulnerability:** In `src/components/ui/chart.tsx`, `ChartStyle` rendered dynamic CSS variables, theme keys, and chart container IDs directly into `<style dangerouslySetInnerHTML={...}>` without sanitization. An attacker supplying malformed keys or colors could break out of CSS rules and execute arbitrary script payloads.
**Learning:** UI components that dynamically generate CSS strings inside `<style dangerouslySetInnerHTML=...>` must sanitize keys, values, and IDs to strip CSS syntax breakers and script tags while permitting safe color syntax (`#`, `rgb`, `hsl`, `/`, `%`).
**Prevention:** Always filter dynamic CSS keys with `key.replace(/[^\w-]/g, "")` and values with `val.replace(/[^\w\s#.,()%/-]/g, "")` before rendering inside raw `<style>` tags.
