## 2026-10-05 - Accessible Accordion Card Pattern
**Learning:** In React UI card lists (such as PlayerPanel), rendering expandable card headers as non-interactive divs prevents keyboard focus and screen reader expansion states. Converting them to semantic `<button type="button">` with `aria-expanded` and `aria-controls` enables full keyboard navigation.
**Action:** Always wrap expandable card headers in semantic `<button type="button">` with `w-full text-left` and ARIA accordion attributes.
