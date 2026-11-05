## 2026-10-11 - Semantic Accordion Triggers
**Learning:** Using generic `<div>` elements with `onClick` for accordion headers in `PlayerPanel.tsx` prevents keyboard users and screen readers from interacting with or understanding the expansion state.
**Action:** Always use semantic `<button type="button">` elements with `aria-expanded` and `aria-controls` attributes for expandable regions, adding utility classes like `w-full text-left` to maintain original visual layouts.
