
## 2026-08-20 - [Accessible Accordions]
**Learning:** Custom `div`-based accordion headers are functionally broken for screen reader users and keyboard navigation by default, but can be seamlessly upgraded to robust disclosure widgets without altering the UI structure.
**Action:** When implementing custom accordions or disclosure widgets, always apply `role="button"`, `tabIndex={0}`, matching `aria-expanded`/`aria-controls` bindings, custom `focus-visible` styles matching the theme, and comprehensive keyboard handlers for both `Enter` and `Space` (with `e.preventDefault()` for Space to prevent scroll).
