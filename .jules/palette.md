
## 2026-08-20 - Accordion Headers
**Learning:** Accordion headers wrapped in `<div>` tags with `onClick` handlers fail to provide proper ARIA attributes, keyboard accessibility, and focus states natively, which breaks interaction for screen reader and keyboard users.
**Action:** Always refactor interactive expanding UI triggers into semantic `<button type="button">` tags, manually apply `aria-expanded` and `aria-controls`, and include theme-appropriate custom focus rings (`focus-visible:ring-...`) to ensure reliable focus management and keyboard accessibility.
