## 2026-08-20 - Accessible Accordion Card Headers
**Learning:** When creating expanding/collapsing card components (like the player cards in PlayerPanel), using non-interactive `<div>` elements for the header makes them inaccessible to keyboard and screen reader users, violating accessibility guidelines.
**Action:** Always use semantic `<button type="button">` elements for accordion triggers. Ensure they have `aria-expanded={isExpanded}` and `aria-controls="[id]"` attributes linking to the content area, and apply focus states using `focus-visible:ring-2 focus-visible:outline-none`.
