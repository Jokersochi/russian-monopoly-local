## 2026-08-20 - Accessible Accordion Headers
**Learning:** When rendering expandable card headers (such as in PlayerPanel.tsx), using non-interactive `<div>` elements breaks keyboard navigation and screen reader support, as users cannot focus or understand the expanded state.
**Action:** Always use semantic `<button type="button">` elements with `aria-expanded` and `aria-controls` for accordion headers, and include custom keyboard focus styles (like `focus-visible:ring-russia-gold`) to ensure full accessibility while adding `w-full text-left` to preserve the block layout.
