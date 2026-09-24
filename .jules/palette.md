## 2026-09-24 - Semantic Accordion Headers
**Learning:** Using non-interactive <div> elements for expand/collapse headers breaks keyboard focus and hides expansion state from screen readers. Adding an explicit aria-label to the button wrapper would override all child text content, preventing screen readers from reading the rich dynamic content inside.
**Action:** Always use semantic <button type="button"> elements with aria-expanded, aria-controls, and w-full text-left for expandable headers, avoiding explicit aria-labels on rich text wrappers.
