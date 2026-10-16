## 2026-10-16 - Accordion Card Pattern
**Learning:** Expandable card headers in this app need semantic buttons to support keyboard focus and screen readers.
**Action:** When rendering expandable card headers, use semantic <button type="button"> elements with aria-expanded={isExpanded} and aria-controls instead of non-interactive <div> elements. Add w-full text-left to preserve the original layout behavior of block-level divs.
