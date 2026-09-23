## 2026-08-20 - Accessible Accordion Card Pattern
**Learning:** Non-interactive elements like `<div>` used as accordion headers prevent keyboard focus and screen reader announcements.
**Action:** When rendering expandable card headers, use semantic `<button type="button">` elements with `aria-expanded`, `aria-controls`, and `w-full text-left` to support keyboard focus and preserve layout.
