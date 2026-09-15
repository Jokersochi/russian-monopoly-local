## 2026-08-20 - Accessible Accordion Headers
**Learning:** Using non-interactive `<div>` elements for accordion headers (like in `PlayerPanel.tsx`) completely hides their functionality from screen readers and keyboard users, despite visual affordances.
**Action:** Always use semantic `<button type="button">` with `aria-expanded` and `aria-controls` for expanding UI elements. Use `w-full text-left` to preserve layout block flow, and `focus-visible:ring-2 focus-visible:ring-russia-gold` for keyboard focus indication.
