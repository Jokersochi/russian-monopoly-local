## 2026-10-01 - Accessible Accordion Headers in Player Panel
**Learning:** Interactive accordion headers rendered as click-enabled `<div>` elements block keyboard navigation and lack screen reader expansion context. Replacing them with semantic `<button type="button">` elements with `aria-expanded` and `aria-controls` provides keyboard focusability and ARIA state without altering layout.
**Action:** Use semantic `<button type="button">` with `aria-expanded` and `aria-controls` for expandable card headers, ensuring `w-full text-left` is set to match block layout.
