## 2026-10-05 - Semantic Accordion Buttons
**Learning:** Avoid adding an explicit `aria-label` attribute to custom interactive wrappers (like accordion trigger buttons) if the element contains rich text or multiple child elements, as `aria-label` overrides all child text content for screen reader users.
**Action:** Use semantic `<button type="button">` elements with `aria-expanded` and `aria-controls` for rich-text accordions.
