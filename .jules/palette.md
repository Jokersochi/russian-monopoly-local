## 2026-04-19 - Accessible Icon-Only Toggle Buttons
**Learning:** Using native `title` attributes for icon-only filter or toggle buttons (like emojis) lacks UI polish and accessibility.
**Action:** Replace `title` with Shadcn `Tooltip` components, and always apply `aria-label` and `aria-pressed` to the button element to ensure proper screen reader announcement and state indication.
