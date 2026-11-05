## 2025-05-18 - Accordion Card Accessibility in Player Panel
**Learning:** Rendering expandable card headers as non-interactive `div`s with `onClick` handlers hides expansion controls from screen readers and keyboard navigation. Using `<button type="button">` with `aria-expanded` and `aria-controls` provides native focusability and accessible state reporting.
**Action:** Always wrap expandable card headers in semantic `<button type="button">` elements with `w-full text-left` and proper ARIA state attributes.
