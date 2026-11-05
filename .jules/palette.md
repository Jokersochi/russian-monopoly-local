## 2026-09-30 - Accessible Accordion Card Triggers
**Learning:** Non-interactive div wrappers with onClick prevent keyboard interaction and lack screen reader state indication. Using semantic <button type="button"> elements with aria-expanded and aria-controls restores focusability and accessible state reporting without changing visual styling.
**Action:** Always wrap expandable card headers in semantic button elements with aria-expanded and aria-controls attributes.
