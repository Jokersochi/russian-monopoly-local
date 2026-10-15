## 2025-05-18 - Accordion Card Accessibility Pattern
**Learning:** Interactive expandable headers wrapped in non-interactive div elements block keyboard and screen reader access. Replacing div with semantic button and aria-expanded/aria-controls provides proper keyboard focus and AT expansion status without aria-label overriding child content.
**Action:** Use semantic button triggers with aria-expanded and aria-controls for expandable cards across all components.
