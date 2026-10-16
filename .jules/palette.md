## 2026-09-27 - Accessible Accordion Triggers
**Learning:** Expandable cards in the game use non-interactive `<div>` elements with `onClick` handlers, preventing keyboard navigation and screen reader state announcements.
**Action:** Use semantic `<button type="button">` elements with `aria-expanded`, `aria-controls`, and `w-full text-left` for expandable card headers.
