## 2024-05-18 - Accordion Accessibility Pattern
**Learning:** When rendering expandable card headers (such as in `PlayerPanel.tsx`), non-interactive `<div>` elements with `onClick` handlers are inaccessible to keyboard users and screen readers, hiding expansion state and focusability.
**Action:** Always use semantic `<button type="button">` elements with `aria-expanded={isExpanded}`, `aria-controls`, and `w-full text-left` to preserve layout while supporting keyboard focus and screen reader states.
