## 2024-05-24 - Accordion Card Semantic Structure
**Learning:** Using a generic `<div>` with an `onClick` handler for expandable accordion cards prevents keyboard accessibility, focus indicators, and screen reader announcements of the expanded state.
**Action:** Always use semantic `<button type="button">` elements with `w-full text-left` to preserve layout, and apply `aria-expanded`, `aria-controls`, and focus ring styles (`focus-visible:ring-ring`) to ensure full keyboard and screen reader accessibility for collapsible sections.
