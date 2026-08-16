## 2026-04-19 - Accessible Accordions
**Learning:** Custom `div`-based accordion headers often lack keyboard and screen reader accessibility, missing `focus-visible` styling, ARIA attributes (`aria-expanded`, `aria-controls`), and `Space`/`Enter` key listeners.
**Action:** Always include `role="button"`, `tabIndex={0}`, `aria-expanded`, and `aria-controls` for custom accordions. Implement an `onKeyDown` handler for `Enter` and `Space` (with `e.preventDefault()` for Space to prevent scrolling), and add `focus-visible:ring-2` to support keyboard navigation.
