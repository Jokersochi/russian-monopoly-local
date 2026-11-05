## 2026-08-20 - CSS Injection in ChartStyle Component
**Vulnerability:** The `ChartStyle` component in `src/components/ui/chart.tsx` directly interpolated dynamic `id`, configuration keys, and CSS color values into a `<style>` element using `dangerouslySetInnerHTML`.
**Learning:** `dangerouslySetInnerHTML` inside `<style>` blocks allows raw CSS payload injection if component IDs, theme names, or CSS color string variables contain unsanitized input or special characters (such as quotes or brackets).
**Prevention:** Always sanitize dynamic strings before rendering inside inline `<style>` tags using regex restrictions (`[^\w-]` for keys/IDs and `[^\w\s#.,()%/-]` for values).
