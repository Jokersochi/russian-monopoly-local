## 2025-09-28 - Accessible Accordion Card Headers in Player Panel
**Learning:** Using non-interactive `<div>` elements with `onClick` for expandable card headers breaks keyboard navigation and screen reader support. Wrapping headers with `<button type=button>` with `aria-expanded` and `aria-controls` restores standard tab focus and ARIA expansion semantics without affecting card layout.
**Action:** Always use `<button type=button>` with `w-full text-left`, `aria-expanded`, and `aria-controls` for expandable card headers in custom UI components.
