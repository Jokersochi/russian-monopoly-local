## 2026-10-03 - Accessible Expandable Player Cards
**Learning:** Using a `<div>` with an `onClick` handler for expandable sections creates an inaccessible element for keyboard and screen reader users.
**Action:** Use a semantic `<button type="button">` with `w-full text-left` to preserve layout, and provide `aria-expanded` and `aria-controls` attributes linked to the loop index to ensure clear accessibility state.
