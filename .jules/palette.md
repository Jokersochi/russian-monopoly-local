## 2026-10-06 - Accessible Accordion Cards
**Learning:** Avoid adding an explicit aria-label attribute to custom interactive wrappers (like accordion trigger buttons) if the element contains rich text or multiple child elements, as aria-label overrides all child text content for screen reader users.
**Action:** Use semantic button elements with aria-expanded/aria-controls and rely on child text for content.
