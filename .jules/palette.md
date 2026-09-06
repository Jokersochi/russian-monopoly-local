## 2026-08-20 - Accordion Keyboard Accessibility
**Learning:** Avoid adding an explicit `aria-label` attribute to custom interactive wrappers (like accordion trigger buttons) if the element contains rich text or multiple child elements, as `aria-label` overrides all child text content for screen reader users.
**Action:** Use semantic `<button type="button">` with `aria-expanded` and `aria-controls` linked to the content's `id`, and rely on the child elements for the accessible name, rather than adding a top-level `aria-label`.
