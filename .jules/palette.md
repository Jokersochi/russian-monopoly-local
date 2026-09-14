## 2026-08-20 - Player Panel Accordion Buttons
**Learning:** Expanding accordion UI triggers built using `<div>` elements are inaccessible by default via keyboards and screen readers.
**Action:** Always replace them with semantic `<button type="button">` wrappers, apply appropriate standard ARIA attributes (`aria-expanded`, `aria-controls`), and use `w-full text-left` to preserve their original block-level visual styling. Always test with tab interactions and screen readers.
