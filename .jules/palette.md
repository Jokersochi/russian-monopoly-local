## 2026-08-20 - Semantic Accordion Controls
**Learning:** Using clickable `<div>` elements for card accordions prevents keyboard focus and screen reader expansion state announcements.
**Action:** Always wrap expandable card headers in semantic `<button type="button">` with `aria-expanded` and `aria-controls` pointing to the collapsible container ID.
