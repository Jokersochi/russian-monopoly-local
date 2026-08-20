## 2026-04-19 - [Accessible Accordions]
**Learning:** Custom `div`-based accordion headers must include `role="button"`, `tabIndex={0}`, `aria-expanded`, `aria-controls` matching the target's `id`, focus-visible styles, and an `onKeyDown` handler for 'Enter' and 'Space' that calls `e.preventDefault()` for Space to prevent page scrolling.
**Action:** Always implement this full set of attributes and event handlers when creating a custom accordion header to ensure keyboard and screen reader accessibility, as I did today in `src/components/PlayerPanel.tsx`.
