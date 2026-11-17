## 2024-05-24 - Accordion Accessibility
**Learning:** Expandable card headers built with divs lack keyboard focus and screen reader support for their expanded state.
**Action:** Always use semantic `<button type="button">` with `aria-expanded` and `aria-controls` for accordion headers, adding `w-full text-left` to maintain block layout.
