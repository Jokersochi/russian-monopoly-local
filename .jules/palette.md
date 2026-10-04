## 2026-10-02 - Accessible Accordion Card Pattern
**Learning:** Interactive expandable card headers require semantic <button> elements with aria-expanded and aria-controls rather than clickable <div>s to support keyboard navigation and screen readers.
**Action:** Always replace non-interactive clickable <div> containers with semantic <button type="button"> and proper ARIA states.
