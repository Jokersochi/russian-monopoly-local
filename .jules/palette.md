## 2024-10-18 - Semantic Accordion Cards
**Learning:** Non-interactive divs with onClick handlers for accordions prevent keyboard navigation and break screen reader context.
**Action:** Always use semantic <button type="button"> elements with aria-expanded, aria-controls, w-full, text-left, and focus-visible classes for expandable card headers.
