## 2026-09-28 - Expandable Card Headers
**Learning:** When rendering expandable card headers, using non-interactive div elements breaks keyboard navigation and screen reader support.
**Action:** Always use semantic <button type="button"> elements with aria-expanded and aria-controls attributes instead of div tags for accordion-like interactions.
