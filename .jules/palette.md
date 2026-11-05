## 2025-05-20 - Accessible Accordion Card Pattern
**Learning:** Converting non-interactive expandable card header divs into semantic `<button type="button">` elements with `aria-expanded`, `aria-controls`, and `w-full text-left` restores full keyboard focus/interaction while preserving existing flex layouts and visual card designs.
**Action:** Always wrap expandable card headers in semantic button elements with aria state attributes instead of applying click handlers to plain divs.
