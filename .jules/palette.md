## 2026-10-06 - Accessible Accordion Triggers in Player Cards
**Learning:** Converting non-interactive click handlers on card headers to semantic `<button type=button>` elements with `aria-expanded` and `aria-controls` enables full keyboard navigation (Tab/Space/Enter) and screen reader support without breaking card styling.
**Action:** Use semantic `<button type=button>` with explicit ARIA expansion attributes when creating collapsible card headers or accordions.
