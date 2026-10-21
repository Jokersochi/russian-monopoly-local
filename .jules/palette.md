## 2025-02-09 - Accessible Accordion Headers
**Learning:** Expanding/collapsing elements that use `div` tags lack keyboard accessibility and screen reader support, even if styled to look interactive.
**Action:** When implementing custom accordion headers or expandable sections, always use semantic `<button type="button">` tags. Include `aria-expanded`, `aria-controls`, and ensure it has proper focus styles (`focus-visible:ring-2`) and keyboard navigation support.
