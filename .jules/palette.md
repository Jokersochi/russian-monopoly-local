## 2026-10-24 - Accessible Accordion Card Controls
**Learning:** Replacing clickable `div` elements in card headers with semantic `<button type=button>` elements combined with `aria-expanded` and `aria-controls` enables native keyboard focus/triggering and screen reader expansion notifications without breaking existing layout or styling.
**Action:** Always wrap expandable card headers in semantic button controls with appropriate ARIA attributes rather than binding click handlers to generic `div` elements.
