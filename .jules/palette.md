## 2026-10-09 - Accessible Accordion Headers in Cards
**Learning:** Using non-interactive `<div>` elements with `onClick` for expandable card triggers creates accessibility barriers for keyboard and screen reader users. Refactoring triggers to semantic `<button type="button">` with `aria-expanded`, `aria-controls`, and visible focus rings enables full keyboard navigation without altering card design.
**Action:** Always wrap expandable card headers in semantic `<button type="button">` elements and manage `aria-expanded` and `aria-controls` attributes.
