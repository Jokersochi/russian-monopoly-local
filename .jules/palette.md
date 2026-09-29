## 2026-09-29 - Accessible Accordion Trigger Pattern
**Learning:** When turning expandable card headers into semantic button triggers, using `w-full text-left` and `focus-visible:ring` preserves existing card typography and grid layout while enabling standard keyboard focus and screen reader expansion states without overriding rich child content.
**Action:** Always wrap expandable card headers in semantic `<button type="button">` elements with `aria-expanded` and `aria-controls`.
