## 2026-04-19 - Accessible Tooltips for Icon Buttons
**Learning:** Native browser `title` attributes on icon-only buttons (like emojis in game logs) provide inconsistent tooltip behaviors and lack proper screen reader context for active states.
**Action:** When implementing icon-only filter or toggle buttons, replace native `title` attributes with Shadcn `Tooltip` components for UI polish, and always apply `aria-label` and `aria-pressed` to the button element to ensure proper screen reader announcement and state indication.
