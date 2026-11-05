## 2026-10-07 - Accessible Accordion Card Triggers
**Learning:** Rendering expandable card headers as non-interactive divs prevents keyboard accessibility and hides expansion state from screen readers. Using semantic button elements with aria-expanded and aria-controls restores keyboard navigation and screen reader announcements without changing layout.
**Action:** Always use semantic <button type="button"> elements with aria-expanded and aria-controls for expandable card headers.
