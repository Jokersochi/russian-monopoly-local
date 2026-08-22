## 2026-08-20 - [Accessible Accordions]
**Learning:** Custom `div`-based accordion headers (like in `PlayerPanel.tsx`) must include `role="button"`, `tabIndex={0}`, `aria-expanded`, `aria-controls` matching the target's `id`, focus-visible styles, and an `onKeyDown` handler for 'Enter' and 'Space' that calls `e.preventDefault()` for Space to prevent page scrolling.
**Action:** Always implement this pattern when replacing native `<button>` or `<details>` elements with custom `div` interactivity.
