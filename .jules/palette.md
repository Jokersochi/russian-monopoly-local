## 2026-08-20 - Accessible Custom Accordions
**Learning:** Custom `div`-based accordion headers must include `role="button"`, `tabIndex={0}`, `aria-expanded`, `aria-controls` matching the target's `id`, focus-visible styles, and an `onKeyDown` handler for 'Enter' and 'Space' that calls `e.preventDefault()` for Space to prevent page scrolling.
**Action:** Always apply this pattern when implementing custom interactive wrappers like accordion trigger buttons.
