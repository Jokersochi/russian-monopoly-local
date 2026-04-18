## 2026-04-14 - Accessible Language Selection
**Learning:** Icon-only language selection buttons (e.g., country flags) are inaccessible without explicit `aria-label` values. The `aria-pressed` attribute is necessary for groups of buttons acting as stateful toggles (like player count). Decorative emojis read out by screen readers disrupt the UX.
**Action:** When adding icon-only buttons, always use `aria-label` and `Tooltip`. Use `aria-pressed` for selection buttons, and hide decorative text nodes or emojis with `aria-hidden="true"`.
