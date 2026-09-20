## 2026-08-20 - Accessible Accordion Headers in PlayerPanel
**Learning:** Expandable card headers made of non-interactive `<div>` elements prevent keyboard navigation and do not announce expansion states to screen reader users.
**Action:** Replace clickable `<div>` wrappers with semantic `<button type=button>` elements equipped with `aria-expanded={isExpanded}`, `aria-controls`, `id`, `aria-hidden` on indicator icons, and `focus-visible:ring-russia-gold` styling.
