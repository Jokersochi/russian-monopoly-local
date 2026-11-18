## 2025-05-18 - Semantic Accordion Cards in Player Panel
**Learning:** In expandable card UI components, using interactive block elements (`<button type="button">` with `aria-expanded` and `aria-controls`) ensures keyboard accessibility and screen reader support without overriding child node text, unlike using non-interactive `<div>` wrappers or adding explicit `aria-label` attributes on rich containers.
**Action:** Always replace non-interactive `<div>` click targets in card headers with full-width `<button type="button">` elements and proper ARIA states.
