## 2026-04-19 - Accessible Filter Buttons in GameLog
**Learning:** Using native `title` attributes for icon-only filter buttons (like emojis) provides poor accessibility and visual UX. Screen readers often ignore them, and they lack custom styling.
**Action:** Replace `title` attributes with Shadcn `Tooltip` components composed with `TooltipTrigger` (asChild), and explicitly add `aria-label` and `aria-pressed` to the `<button>` elements to ensure clear screen reader announcements and toggle state indication.
