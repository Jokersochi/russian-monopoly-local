## 2026-08-20 - Accessible Accordion Headers
**Learning:** When rendering expandable card headers (such as in PlayerPanel), using non-interactive div elements prevents keyboard navigation and screen reader state announcements.
**Action:** Always use semantic <button type="button"> elements with aria-expanded, aria-controls, and w-full text-left to support keyboard focus and preserve layout.
