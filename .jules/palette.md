
## 2026-04-14 - Accessible Icon Buttons in Settings
**Learning:** Icon-only buttons (like country flags for languages) are completely opaque to screen readers. Adding just an `aria-label` is good, but combining it with `aria-pressed` for toggle states and a `Tooltip` for sighted users creates a complete, universally accessible component. Purely decorative elements must be explicitly hidden with `aria-hidden="true"`.
**Action:** When implementing icon-only UI controls, always use this trifecta: Tooltip (sighted context) + aria-label (screen reader context) + aria-pressed/expanded (state context). Hide decorative text/emojis.
